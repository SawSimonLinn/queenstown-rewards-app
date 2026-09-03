-- The secure, atomic redemption transaction. Split into two SECURITY
-- DEFINER functions:
--   1. request_redemption(token, location_id) — called by the customer
--      after scanning. Validates everything and creates exactly one
--      redemption row in 'pending_staff_confirmation' status. Does NOT
--      mark the entitlement redeemed — a customer can never do that
--      themselves, by construction: nothing in this function can move an
--      entitlement to 'redeemed'.
--   2. confirm_redemption(redemption_id) — called only by staff/admin,
--      typically from the same device the customer shows the pending
--      screen to. This is the ONLY path that marks an entitlement redeemed.
-- Each function runs as a single Postgres function invocation, which is
-- one transaction: either every step commits, or none do.

-- Returns the customer's entitlement for a campaign's current eligible
-- month, creating it if it doesn't exist yet (every signed-up customer is
-- eligible by default — Phase 11 can later mark specific customers
-- ineligible via a staff/admin-only path). Uses the database's own clock,
-- never the device's.
create function public.get_or_create_current_entitlement(p_campaign_id uuid)
returns public.monthly_entitlements
language plpgsql
security definer
set search_path = public
as $$
declare
  v_period date := date_trunc('month', now())::date;
  v_entitlement public.monthly_entitlements;
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  insert into public.monthly_entitlements (profile_id, campaign_id, period_month, status)
  values (auth.uid(), p_campaign_id, v_period, 'eligible')
  on conflict (profile_id, campaign_id, period_month) do update
    set profile_id = excluded.profile_id
  returning * into v_entitlement;

  return v_entitlement;
end;
$$;

revoke execute on function public.get_or_create_current_entitlement(uuid) from public;
grant execute on function public.get_or_create_current_entitlement(uuid) to authenticated;

create type public.redemption_request_result as (
  redemption_id uuid,
  campaign_id uuid,
  campaign_name text,
  location_id uuid,
  location_name text,
  status public.redemption_status
);

create function public.request_redemption(p_token text, p_location_id uuid)
returns public.redemption_request_result
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qr public.redemption_qr_codes;
  v_campaign public.burger_campaigns;
  v_location public.locations;
  v_entitlement public.monthly_entitlements;
  v_redemption public.redemptions;
  v_result public.redemption_request_result;
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  -- 2 & 3: validate the scanned QR code is genuine, active and unexpired.
  select * into v_qr from public.redemption_qr_codes where token = p_token;
  if not found then
    raise exception 'INVALID_QR';
  end if;

  if not v_qr.is_active or v_qr.expires_at <= now() then
    raise exception 'EXPIRED_QR';
  end if;

  -- 4: confirm the selected location matches the QR code's location.
  if v_qr.location_id <> p_location_id then
    raise exception 'WRONG_LOCATION';
  end if;

  select * into v_campaign from public.burger_campaigns where id = v_qr.campaign_id;
  select * into v_location from public.locations where id = v_qr.location_id;

  -- 5 & 6: locate the eligible entitlement and confirm it isn't already redeemed.
  v_entitlement := public.get_or_create_current_entitlement(v_qr.campaign_id);

  if v_entitlement.status = 'redeemed' then
    raise exception 'ALREADY_REDEEMED';
  end if;

  if v_entitlement.status in ('expired', 'ineligible') then
    raise exception 'INELIGIBLE';
  end if;

  -- Resume an existing pending request for this entitlement instead of
  -- erroring, so re-scanning the same code after backgrounding the app is
  -- a safe no-op rather than a confusing failure.
  select * into v_redemption
  from public.redemptions
  where entitlement_id = v_entitlement.id
    and status = 'pending_staff_confirmation';

  if not found then
    -- 8: create exactly one redemption record. The partial unique index on
    -- (entitlement_id where status <> 'cancelled') makes this atomic even
    -- under concurrent requests for the same entitlement.
    insert into public.redemptions (entitlement_id, profile_id, location_id, status, redeemed_at)
    values (v_entitlement.id, auth.uid(), v_qr.location_id, 'pending_staff_confirmation', now())
    returning * into v_redemption;

    -- 10: immutable audit entry.
    insert into public.audit_logs (action, actor_profile_id, target_id, metadata)
    values (
      'redemption_created',
      auth.uid(),
      v_redemption.id,
      jsonb_build_object('campaign_id', v_campaign.id, 'location_id', v_location.id)
    );
  end if;

  v_result.redemption_id := v_redemption.id;
  v_result.campaign_id := v_campaign.id;
  v_result.campaign_name := v_campaign.name;
  v_result.location_id := v_location.id;
  v_result.location_name := v_location.name;
  v_result.status := v_redemption.status;
  return v_result;
end;
$$;

revoke execute on function public.request_redemption(text, uuid) from public;
grant execute on function public.request_redemption(text, uuid) to authenticated;

-- Lets a customer cancel their OWN still-pending request (the "manual
-- cancellation" step from Phase 8). Never touches the entitlement, which
-- was never marked redeemed in the first place.
create function public.cancel_pending_redemption(p_redemption_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_redemption public.redemptions;
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select * into v_redemption
  from public.redemptions
  where id = p_redemption_id
    and profile_id = auth.uid()
    and status = 'pending_staff_confirmation';

  if not found then
    raise exception 'NOT_FOUND';
  end if;

  update public.redemptions set status = 'cancelled' where id = p_redemption_id;

  insert into public.audit_logs (action, actor_profile_id, target_id, metadata)
  values ('redemption_cancelled', auth.uid(), p_redemption_id, '{}'::jsonb);
end;
$$;

revoke execute on function public.cancel_pending_redemption(uuid) from public;
grant execute on function public.cancel_pending_redemption(uuid) to authenticated;

-- 7: the staff-confirmation step. This is the ONLY function that can move
-- a redemption to 'confirmed' and an entitlement to 'redeemed' — a
-- customer has no path to either.
create function public.confirm_redemption(p_redemption_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_redemption public.redemptions;
  v_staff_member_id uuid;
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  if not public.is_staff_or_admin() then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select * into v_redemption from public.redemptions where id = p_redemption_id;
  if not found then
    raise exception 'NOT_FOUND';
  end if;

  if v_redemption.status <> 'pending_staff_confirmation' then
    raise exception 'ALREADY_PROCESSED';
  end if;

  select id into v_staff_member_id
  from public.staff_members
  where profile_id = auth.uid()
    and location_id = v_redemption.location_id
    and is_active;

  if v_staff_member_id is null and not public.is_admin() then
    raise exception 'WRONG_LOCATION_FOR_STAFF';
  end if;

  -- 8 (staff_member_id) & 9: exactly one redemption record already exists
  -- (from request_redemption) — this only updates it and marks the
  -- entitlement redeemed, using the database's clock.
  update public.redemptions
  set status = 'confirmed', staff_member_id = v_staff_member_id
  where id = p_redemption_id;

  update public.monthly_entitlements
  set status = 'redeemed', redeemed_at = now()
  where id = v_redemption.entitlement_id;

  -- 10: immutable audit entry.
  insert into public.audit_logs (action, actor_profile_id, target_id, metadata)
  values (
    'redemption_confirmed',
    auth.uid(),
    p_redemption_id,
    jsonb_build_object('staff_member_id', v_staff_member_id)
  );
end;
$$;

revoke execute on function public.confirm_redemption(uuid) from public;
grant execute on function public.confirm_redemption(uuid) to authenticated;

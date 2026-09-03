-- A user must join the Burger of the Month Club before they can be issued a
-- monthly entitlement (and therefore before they can redeem — request_redemption
-- calls this function internally, so this single check gates both). This
-- replaces the "every signed-up customer is eligible by default" behavior
-- from 20260902152000_create_redemption_functions.sql now that joining is a
-- real, explicit step.
create or replace function public.get_or_create_current_entitlement(p_campaign_id uuid)
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

  if not exists (
    select 1 from public.club_memberships
    where profile_id = auth.uid() and status = 'active'
  ) then
    raise exception 'NOT_CLUB_MEMBER';
  end if;

  insert into public.monthly_entitlements (profile_id, campaign_id, period_month, status)
  values (auth.uid(), p_campaign_id, v_period, 'eligible')
  on conflict (profile_id, campaign_id, period_month) do update
    set profile_id = excluded.profile_id
  returning * into v_entitlement;

  return v_entitlement;
end;
$$;

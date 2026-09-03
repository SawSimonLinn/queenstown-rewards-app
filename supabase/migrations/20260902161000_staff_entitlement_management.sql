-- Phase 11: staff/admin need to manage customer eligibility (mark a
-- customer's current entitlement ineligible/eligible again). This was
-- deliberately unwritable by anyone in Phase 7/9 — this migration adds a
-- narrow, defended write path for staff/admin only.

create policy "Staff and admins can update entitlement status"
  on public.monthly_entitlements for update
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

-- Even with that policy, guard against a staff account rewriting *which*
-- customer/campaign/period a row refers to — only status/redeemed_at may
-- change via this path.
create function public.prevent_entitlement_identity_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.profile_id := old.profile_id;
  new.campaign_id := old.campaign_id;
  new.period_month := old.period_month;
  return new;
end;
$$;

create trigger entitlements_prevent_identity_change
  before update on public.monthly_entitlements
  for each row
  execute function public.prevent_entitlement_identity_change();

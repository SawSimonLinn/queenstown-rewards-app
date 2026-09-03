create type public.entitlement_status as enum ('eligible', 'redeemed', 'expired', 'ineligible');

create table public.monthly_entitlements (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  campaign_id uuid not null references public.burger_campaigns (id) on delete cascade,
  -- First day of the eligible month, e.g. 2026-09-01. Using a real date
  -- (rather than a free-text "2026-09" string) lets Postgres enforce
  -- validity and lets the app compute eligibility without relying on
  -- device time — see the redemptions table and Phase 9 for why.
  period_month date not null,
  status public.entitlement_status not null default 'eligible',
  created_at timestamptz not null default now(),
  redeemed_at timestamptz,
  -- The core "one reward per customer per campaign per month" guarantee.
  -- A unique index is enforced atomically by Postgres even under
  -- concurrent inserts, so two simultaneous requests cannot both succeed.
  unique (profile_id, campaign_id, period_month)
);

comment on table public.monthly_entitlements is
  'One row per customer per campaign per eligible month. Created and updated exclusively by backend logic (Phase 9) — never directly by clients.';

create index monthly_entitlements_profile_id_idx on public.monthly_entitlements (profile_id);
create index monthly_entitlements_campaign_id_idx on public.monthly_entitlements (campaign_id);
create index monthly_entitlements_status_idx on public.monthly_entitlements (status);

alter table public.monthly_entitlements enable row level security;

create policy "Customers can view their own entitlements"
  on public.monthly_entitlements for select
  using (auth.uid() = profile_id);

create policy "Staff and admins can view all entitlements"
  on public.monthly_entitlements for select
  using (public.is_staff_or_admin());

-- No INSERT/UPDATE/DELETE policy for any client role. A customer must never
-- be able to create their own entitlement or mark it redeemed directly —
-- both happen only via the SECURITY DEFINER redemption function in Phase 9.

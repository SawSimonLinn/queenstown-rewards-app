create type public.redemption_status as enum (
  'pending_staff_confirmation',
  'confirmed',
  'cancelled',
  'corrected'
);

create table public.redemptions (
  id uuid primary key default gen_random_uuid(),
  -- UNIQUE: guarantees at most one redemption row per entitlement, enforced
  -- atomically by Postgres even if two redemption requests race each other.
  -- This is the hard backstop behind the Phase 9 redemption transaction.
  entitlement_id uuid not null unique references public.monthly_entitlements (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  location_id uuid not null references public.locations (id) on delete restrict,
  staff_member_id uuid references public.staff_members (id) on delete set null,
  status public.redemption_status not null default 'pending_staff_confirmation',
  -- Set by the backend function using the database's clock (now()), never
  -- accepted from the client, so device time can't be spoofed.
  redeemed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

comment on table public.redemptions is
  'One row per completed redemption. Created and updated exclusively by the Phase 9 secure redemption function — never directly by clients.';

create index redemptions_profile_id_idx on public.redemptions (profile_id);
create index redemptions_location_id_idx on public.redemptions (location_id);
create index redemptions_status_idx on public.redemptions (status);

alter table public.redemptions enable row level security;

create policy "Customers can view their own redemption history"
  on public.redemptions for select
  using (auth.uid() = profile_id);

create policy "Staff and admins can view all redemptions"
  on public.redemptions for select
  using (public.is_staff_or_admin());

-- No INSERT/UPDATE/DELETE policy for any client role. A customer must never
-- create a redemption record or alter its timestamp/location directly;
-- staff corrections/cancellations (with an audit trail) also go through a
-- secure function, not a direct UPDATE, per the brief's audit requirement.

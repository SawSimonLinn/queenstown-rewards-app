create type public.staff_permission as enum (
  'confirm_redemptions',
  'manage_specials',
  'manage_campaigns',
  'manage_locations'
);

create table public.staff_members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  location_id uuid not null references public.locations (id) on delete cascade,
  permissions public.staff_permission[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (profile_id, location_id)
);

comment on table public.staff_members is
  'Grants a profile staff access at a specific location. Managed by admins in the Phase 11 dashboard, never by the mobile app.';

create index staff_members_profile_id_idx on public.staff_members (profile_id);
create index staff_members_location_id_idx on public.staff_members (location_id);

alter table public.staff_members enable row level security;

create policy "Staff can view their own staff record"
  on public.staff_members for select
  using (auth.uid() = profile_id);

create policy "Admins can view all staff records"
  on public.staff_members for select
  using (public.is_admin());

-- No INSERT/UPDATE/DELETE policy for any client role: staff accounts are
-- created and managed exclusively through a secure server-side function
-- (Phase 11), never directly by the mobile or admin-dashboard client.

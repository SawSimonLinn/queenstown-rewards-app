create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  suburb text not null default 'Queenstown',
  phone text not null,
  latitude double precision not null,
  longitude double precision not null,
  -- Shape: { monday: {open, close} | null, ..., sunday: {open, close} | null }
  opening_hours jsonb not null default '{}'::jsonb,
  is_participating boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.locations is 'The 8 Queenstown restaurant locations.';

create index locations_is_participating_idx on public.locations (is_participating);

alter table public.locations enable row level security;

-- Location info (address, hours, etc.) is public marketing content.
create policy "Anyone can view locations"
  on public.locations for select
  using (true);

create policy "Staff and admins can manage locations"
  on public.locations for all
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

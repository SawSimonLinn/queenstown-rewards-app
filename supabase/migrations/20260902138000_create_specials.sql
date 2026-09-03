create table public.specials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_url text,
  start_date timestamptz not null,
  end_date timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint specials_dates_check check (end_date > start_date)
);

comment on table public.specials is 'Promotions and specials, optionally scoped to specific locations.';

create index specials_start_end_idx on public.specials (start_date, end_date);

create table public.special_locations (
  special_id uuid not null references public.specials (id) on delete cascade,
  location_id uuid not null references public.locations (id) on delete cascade,
  primary key (special_id, location_id)
);

create index special_locations_location_id_idx on public.special_locations (location_id);

alter table public.specials enable row level security;
alter table public.special_locations enable row level security;

create policy "Anyone can view specials"
  on public.specials for select
  using (true);

create policy "Staff and admins can manage specials"
  on public.specials for all
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

create policy "Anyone can view special locations"
  on public.special_locations for select
  using (true);

create policy "Staff and admins can manage special locations"
  on public.special_locations for all
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

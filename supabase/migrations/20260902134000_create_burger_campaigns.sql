create type public.campaign_status as enum ('draft', 'scheduled', 'active', 'expired');

create table public.burger_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  image_url text,
  terms_and_restrictions text not null default '',
  start_date timestamptz not null,
  end_date timestamptz not null,
  status public.campaign_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint burger_campaigns_dates_check check (end_date > start_date)
);

comment on table public.burger_campaigns is 'Monthly "Burger of the Month" campaigns.';

create index burger_campaigns_status_idx on public.burger_campaigns (status);

-- Proper many-to-many relation instead of an array column, so referential
-- integrity is enforced by foreign keys rather than application code.
create table public.campaign_locations (
  campaign_id uuid not null references public.burger_campaigns (id) on delete cascade,
  location_id uuid not null references public.locations (id) on delete cascade,
  primary key (campaign_id, location_id)
);

create index campaign_locations_location_id_idx on public.campaign_locations (location_id);

alter table public.burger_campaigns enable row level security;
alter table public.campaign_locations enable row level security;

create policy "Anyone can view active campaigns"
  on public.burger_campaigns for select
  using (status = 'active' or public.is_staff_or_admin());

create policy "Staff and admins can manage campaigns"
  on public.burger_campaigns for all
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

create policy "Anyone can view campaign locations for visible campaigns"
  on public.campaign_locations for select
  using (
    exists (
      select 1 from public.burger_campaigns c
      where c.id = campaign_id
        and (c.status = 'active' or public.is_staff_or_admin())
    )
  );

create policy "Staff and admins can manage campaign locations"
  on public.campaign_locations for all
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

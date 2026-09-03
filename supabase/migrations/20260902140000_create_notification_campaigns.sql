create type public.notification_campaign_status as enum ('draft', 'scheduled', 'sent');

create table public.notification_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  scheduled_for timestamptz,
  status public.notification_campaign_status not null default 'draft',
  deep_link text,
  created_at timestamptz not null default now()
);

comment on table public.notification_campaigns is
  'Push notification campaigns, created/sent by staff via the Phase 11 admin dashboard.';

create index notification_campaigns_status_idx on public.notification_campaigns (status);

alter table public.notification_campaigns enable row level security;

create policy "Staff and admins can view notification campaigns"
  on public.notification_campaigns for select
  using (public.is_staff_or_admin());

create policy "Staff and admins can manage notification campaigns"
  on public.notification_campaigns for all
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

-- No policy for ordinary customers: they only ever receive the resulting
-- push notification, never read this table directly.

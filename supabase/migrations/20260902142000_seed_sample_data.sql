-- Safe, clearly-labelled SAMPLE data — mirrors src/constants/sample-data.ts
-- so the app looks the same once screens switch from local sample data to
-- real Supabase queries. Replace with real content once supplied.
--
-- Deliberately NOT seeded here: profiles, staff_members, monthly_entitlements,
-- redemptions, push_tokens. Those depend on real auth.users (profiles are
-- created by the Phase 6 signup trigger) or on backend logic that doesn't
-- exist until Phase 9 — seeding fake versions of them would be misleading.

with inserted_locations as (
  insert into public.locations (name, address, suburb, phone, latitude, longitude, opening_hours, is_participating)
  select
    'Queenstown Rewards Sample Location ' || n,
    n || ' Sample Street',
    'Queenstown',
    '+64 3 000 000' || n,
    -45.0312 + (n - 1) * 0.003,
    168.6626 + (n - 1) * 0.003,
    jsonb_build_object(
      'monday', jsonb_build_object('open', '11:00', 'close', '21:00'),
      'tuesday', jsonb_build_object('open', '11:00', 'close', '21:00'),
      'wednesday', jsonb_build_object('open', '11:00', 'close', '21:00'),
      'thursday', jsonb_build_object('open', '11:00', 'close', '21:00'),
      'friday', jsonb_build_object('open', '11:00', 'close', '22:00'),
      'saturday', jsonb_build_object('open', '11:00', 'close', '22:00'),
      'sunday', jsonb_build_object('open', '11:00', 'close', '21:00')
    ),
    true
  from generate_series(1, 8) as n
  returning id, name
),
inserted_campaign as (
  insert into public.burger_campaigns (name, description, terms_and_restrictions, start_date, end_date, status)
  values (
    'The Sample Stack (Sample Data)',
    'A placeholder Burger of the Month entry. Real campaign details, name, and photography will replace this once supplied.',
    'Sample terms: one redemption per eligible customer per calendar month, in-store only, while available.',
    date_trunc('month', now()),
    (date_trunc('month', now()) + interval '1 month' - interval '1 second'),
    'active'
  )
  returning id
),
inserted_specials as (
  insert into public.specials (title, description, start_date, end_date)
  values
    (
      'Sample Tuesday Special',
      'Placeholder special offer text — real specials are managed by staff in Phase 11.',
      date_trunc('month', now()),
      (date_trunc('month', now()) + interval '1 month' - interval '1 second')
    ),
    (
      'Sample Happy Hour',
      'Placeholder special offer text — real specials are managed by staff in Phase 11.',
      date_trunc('month', now()),
      (date_trunc('month', now()) + interval '1 month' - interval '1 second')
    )
  returning id, title
)
insert into public.campaign_locations (campaign_id, location_id)
select
  (select id from inserted_campaign),
  id
from inserted_locations
where name in ('Queenstown Rewards Sample Location 1', 'Queenstown Rewards Sample Location 2');

-- Link each seeded special to one location, matching the local sample data.
insert into public.special_locations (special_id, location_id)
select s.id, l.id
from public.specials s
join public.locations l
  on (s.title = 'Sample Tuesday Special' and l.name = 'Queenstown Rewards Sample Location 1')
  or (s.title = 'Sample Happy Hour' and l.name = 'Queenstown Rewards Sample Location 2')
where s.title in ('Sample Tuesday Special', 'Sample Happy Hour');

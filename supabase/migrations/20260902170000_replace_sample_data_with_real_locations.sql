-- Replaces the fake "Queenstown Rewards Sample Location 1..8" rows (seeded by
-- 20260902142000_seed_sample_data.sql) with the 7 real, verified Queenstown
-- Hospitality Group locations, and hides the fake "The Sample Stack (Sample
-- Data)" Burger of the Month campaign and its fake specials from customers.
--
-- This mirrors the verified location data already in src/data/locations.ts
-- (the typed source of truth the Locations tab reads from). This table
-- (public.locations) is separate — it only backs Burger of the Month
-- "Participating locations" lists, specials, and QR redemption — but it
-- must not contain fictional locations either.
--
-- opening_hours is intentionally left at its '{}'::jsonb default here: this
-- column's shape (one open/close pair per day) can't represent the real
-- multi-period schedules (brunch/lunch/dinner, "to close" dinners, Del Mar's
-- still-unconfirmed hours) that src/data/locations.ts already models
-- correctly and that the app actually displays. Do not backfill invented
-- single-period hours into this column.
--
-- latitude/longitude are made nullable below and left NULL: no verified
-- coordinates are available, and nothing in the app currently reads them.
--
-- phone is also made nullable: Queenstown Public House has no verified
-- phone number in the source data, and the rule is to omit unverified
-- fields rather than invent them.

alter table public.locations
  alter column latitude drop not null,
  alter column longitude drop not null,
  alter column phone drop not null;

-- Hide (don't delete) the fake campaign, so any monthly_entitlements /
-- redemptions rows that already reference it by campaign_id are preserved
-- rather than cascade-deleted. Customer queries filter on status = 'active',
-- so an 'expired' campaign no longer surfaces anywhere in the app.
update public.burger_campaigns
set status = 'expired'
where name = 'The Sample Stack (Sample Data)';

-- Remove the fake specials outright — nothing references them that needs
-- preserving.
delete from public.specials
where title in ('Sample Tuesday Special', 'Sample Happy Hour');

-- Remove the 8 fake locations. Cascades to campaign_locations,
-- special_locations and redemption_qr_codes automatically (all declared
-- `on delete cascade`) — this also deletes the QSTOWN-TEST-VALID /
-- QSTOWN-TEST-EXPIRED QR codes seeded in 20260902153000_seed_test_qr_code.sql,
-- since those pointed at a sample location. You'll need to seed new test QR
-- codes (see that migration for the pattern) once a real, active campaign
-- exists to test redemption end-to-end again.
delete from public.locations
where name like 'Queenstown Rewards Sample Location %';

insert into public.locations (name, address, suburb, phone, opening_hours, is_participating)
values
  (
    'Queenstown Public House',
    '1557 Columbia St, San Diego, CA 92101',
    'Little Italy',
    null,
    '{}'::jsonb,
    true
  ),
  (
    'Queenstown Bistro',
    '4545 La Jolla Village Drive, Space 9028, Suite 18, San Diego, CA 92122',
    'Westfield UTC',
    '(858) 623-2748',
    '{}'::jsonb,
    true
  ),
  (
    'Queenstown Village',
    '1044 Wall Street, Suites C & D, La Jolla, CA 92037',
    'La Jolla Village',
    '(858) 667-7925',
    '{}'::jsonb,
    true
  ),
  (
    'Queenstown Del Mar',
    '1435 Camino Del Mar, Suite D, Del Mar, CA 92014',
    'Del Mar Village',
    '(858) 925-5771',
    '{}'::jsonb,
    true
  ),
  (
    'Dunedin New Zealand Eats',
    '3501 30th St, San Diego, CA 92104',
    'North Park',
    '(619) 255-8566',
    '{}'::jsonb,
    true
  ),
  (
    'Raglan Public House',
    '1851 Bacon Street, San Diego, CA 92107',
    'Ocean Beach',
    '(619) 794-2304',
    '{}'::jsonb,
    true
  ),
  (
    'Bare Back Grill',
    '4640 Mission Boulevard, San Diego, CA 92109',
    'Pacific Beach',
    '(858) 274-7117',
    '{}'::jsonb,
    true
  );

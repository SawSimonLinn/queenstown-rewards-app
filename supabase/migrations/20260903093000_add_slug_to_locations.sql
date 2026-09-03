-- Bridges the two "seven real Queenstown locations" datasets: the rich,
-- typed src/data/locations.ts (string slug ids like
-- 'queenstown-public-house', used for hours/map/UI everywhere) and this
-- table (uuid ids, used by specials/burger_campaigns/redemption_qr_codes and
-- by profiles.preferred_location_id's existing FK). `slug` lets the app
-- translate between the two without ever inventing a second copy of the
-- location data in Supabase.
--
-- Names are identical across both datasets today (verified against
-- src/data/locations.ts as of 2026-09-03), so a one-time name match is
-- reliable here. If a location is ever renamed, update its slug alongside it
-- — do not rely on name matching again after this migration.

alter table public.locations add column slug text;

update public.locations set slug = 'queenstown-public-house' where name = 'Queenstown Public House';
update public.locations set slug = 'queenstown-bistro-utc' where name = 'Queenstown Bistro';
update public.locations set slug = 'queenstown-village-la-jolla' where name = 'Queenstown Village';
update public.locations set slug = 'queenstown-del-mar' where name = 'Queenstown Del Mar';
update public.locations set slug = 'dunedin-north-park' where name = 'Dunedin New Zealand Eats';
update public.locations set slug = 'raglan-public-house' where name = 'Raglan Public House';
update public.locations set slug = 'bare-back-grill' where name = 'Bare Back Grill';

alter table public.locations alter column slug set not null;
alter table public.locations add constraint locations_slug_unique unique (slug);

comment on column public.locations.slug is 'Stable key matching the id field in src/data/locations.ts (the app''s typed source of truth for location display data).';

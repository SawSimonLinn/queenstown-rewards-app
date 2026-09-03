-- A real, working QR code for testing the Phase 9 redemption flow, since
-- there's no staff/admin tooling to generate one yet (that's Phase 11).
-- Generate a QR image containing exactly this token text (any free QR
-- generator) to test end-to-end on your phone: QSTOWN-TEST-VALID
--
-- Points at the first seeded location and the active seeded campaign, so
-- redeeming it "at" that location succeeds; scanning it while a DIFFERENT
-- location is selected in the app exercises the wrong-location state.
insert into public.redemption_qr_codes (location_id, campaign_id, token, is_active, expires_at)
select
  (select id from public.locations order by name limit 1),
  (select id from public.burger_campaigns where status = 'active' limit 1),
  'QSTOWN-TEST-VALID',
  true,
  now() + interval '1 year'
where exists (select 1 from public.locations)
  and exists (select 1 from public.burger_campaigns where status = 'active');

-- A second code that's already expired, to test that state directly
-- without waiting a year.
insert into public.redemption_qr_codes (location_id, campaign_id, token, is_active, expires_at)
select
  (select id from public.locations order by name limit 1),
  (select id from public.burger_campaigns where status = 'active' limit 1),
  'QSTOWN-TEST-EXPIRED',
  true,
  now() - interval '1 day'
where exists (select 1 from public.locations)
  and exists (select 1 from public.burger_campaigns where status = 'active');

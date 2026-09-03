-- Tracks whether a customer has completed the first-time preferred-location
-- prompt, so the app never shows it again once set — independent of whether
-- they later clear their preferred_location_id some other way (they can't,
-- from the client, but this keeps the two concerns separate).

alter table public.profiles add column onboarding_completed_at timestamptz;

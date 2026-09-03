-- Signed-in customers' Location Details view history, for the Home screen's
-- "Recently viewed" section. Guests get the equivalent local-only history
-- (see src/lib/recently-viewed-guest.ts) — this table exists so a signed-in
-- customer's history follows their account across devices.
--
-- Same client-writable, owner-only shape as push_tokens
-- (20260902139000_create_push_tokens.sql): the mobile app upserts its own
-- rows directly, keyed on (profile_id, location_id) so a repeat view is a
-- dedupe-and-bump rather than a growing list of rows.

create table public.recently_viewed_locations (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  location_id uuid not null references public.locations (id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (profile_id, location_id)
);

comment on table public.recently_viewed_locations is
  'Per-user Location Details view history for the Home screen''s Recently Viewed section. Client-writable, owner-only — see push_tokens for the same pattern.';

create index recently_viewed_locations_profile_id_viewed_at_idx
  on public.recently_viewed_locations (profile_id, viewed_at desc);

alter table public.recently_viewed_locations enable row level security;

create policy "Users can view their own recently viewed locations"
  on public.recently_viewed_locations for select
  using (auth.uid() = profile_id);

create policy "Users can record their own recently viewed locations"
  on public.recently_viewed_locations for insert
  with check (auth.uid() = profile_id);

create policy "Users can update their own recently viewed locations"
  on public.recently_viewed_locations for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "Users can remove their own recently viewed locations"
  on public.recently_viewed_locations for delete
  using (auth.uid() = profile_id);

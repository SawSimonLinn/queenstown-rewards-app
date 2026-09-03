-- Now that public.locations exists, add the preferred-location reference
-- that was deferred from the Phase 6 profiles migration. The existing
-- "Users can update their own profile" policy already covers this column.

alter table public.profiles
  add column preferred_location_id uuid references public.locations (id) on delete set null;

create index profiles_preferred_location_id_idx on public.profiles (preferred_location_id);

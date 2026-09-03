create type public.push_platform as enum ('ios', 'android', 'web');

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  token text not null,
  platform public.push_platform not null,
  created_at timestamptz not null default now(),
  unique (profile_id, token)
);

comment on table public.push_tokens is 'Expo push tokens, one per device per user. Registered by the mobile app itself (Phase 10).';

create index push_tokens_profile_id_idx on public.push_tokens (profile_id);

alter table public.push_tokens enable row level security;

-- Registering/removing your own device's push token is a normal client
-- operation, unlike the backend-only tables above.
create policy "Users can view their own push tokens"
  on public.push_tokens for select
  using (auth.uid() = profile_id);

create policy "Users can register their own push tokens"
  on public.push_tokens for insert
  with check (auth.uid() = profile_id);

create policy "Users can remove their own push tokens"
  on public.push_tokens for delete
  using (auth.uid() = profile_id);

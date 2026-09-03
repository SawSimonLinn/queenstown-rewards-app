-- Per-user notification inbox. Populated only by trusted backend paths
-- (service-role key, e.g. from a notification_campaigns send or a staff
-- action) — the mobile client can read and mark its own rows as read, but
-- can never create or rewrite notification content itself.

create type public.notification_type as enum (
  'burger_drop',
  'special_offer',
  'account_update',
  'redemption'
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  message text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.notifications is
  'Per-user notification inbox. Rows are written by trusted backend paths only (service role) — the mobile client has no INSERT policy.';

create index notifications_profile_id_idx on public.notifications (profile_id);
create index notifications_profile_id_read_at_idx on public.notifications (profile_id, read_at);
create index notifications_created_at_idx on public.notifications (created_at);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = profile_id);

create policy "Users can mark their own notifications read"
  on public.notifications for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- No INSERT/DELETE policy for any client role: notifications can only be
-- created by trusted backend paths (service role, which bypasses RLS).

-- Locks every column except read_at on UPDATE, so the permissive-looking
-- UPDATE policy above still can't be used to rewrite a notification's
-- content — only to mark it read. Mirrors
-- prevent_entitlement_identity_change() in
-- 20260902161000_staff_entitlement_management.sql.
create function public.prevent_notification_identity_change()
returns trigger
language plpgsql
as $$
begin
  new.profile_id := old.profile_id;
  new.type := old.type;
  new.title := old.title;
  new.message := old.message;
  new.data := old.data;
  new.created_at := old.created_at;
  return new;
end;
$$;

create trigger notifications_prevent_identity_change
  before update on public.notifications
  for each row execute function public.prevent_notification_identity_change();

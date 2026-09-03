create type public.audit_action as enum (
  'redemption_created',
  'redemption_corrected',
  'redemption_cancelled',
  'entitlement_created',
  'campaign_created',
  'campaign_updated',
  'special_created',
  'special_updated',
  'staff_permission_changed'
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action public.audit_action not null,
  actor_profile_id uuid not null references public.profiles (id) on delete restrict,
  target_id uuid not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.audit_logs is
  'Immutable audit trail. Rows are inserted only by secure backend functions (e.g. the Phase 9 redemption function) — never updated or deleted by anyone, including admins.';

create index audit_logs_action_idx on public.audit_logs (action);
create index audit_logs_target_id_idx on public.audit_logs (target_id);
create index audit_logs_created_at_idx on public.audit_logs (created_at);

alter table public.audit_logs enable row level security;

create policy "Admins can view audit logs"
  on public.audit_logs for select
  using (public.is_admin());

-- No INSERT/UPDATE/DELETE policy for any client role, including admins.
-- Rows are written exclusively by SECURITY DEFINER backend functions
-- (Phase 9+), which bypass RLS internally — this table has no client
-- write path at all, keeping the audit trail genuinely immutable.

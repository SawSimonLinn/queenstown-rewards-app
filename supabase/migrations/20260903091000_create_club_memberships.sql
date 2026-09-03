-- Burger of the Month Club membership. Joining is an explicit, terms-gated
-- action distinct from account registration — a customer is never a member
-- just by having an account. All writes go through the join_burger_club()
-- SECURITY DEFINER function below; RLS only allows customers to read their
-- own membership.

create type public.club_membership_status as enum ('active', 'cancelled');

create table public.club_memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status public.club_membership_status not null default 'active',
  joined_at timestamptz not null default now(),
  terms_accepted_at timestamptz not null,
  terms_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.club_memberships is
  'Burger of the Month Club membership. A user can have at most one active membership (see the partial unique index below). Writes go through join_burger_club() only.';

-- Enforces "each user can have only one active club membership" at the
-- database level, independent of any client-side check.
create unique index club_memberships_one_active_per_profile
  on public.club_memberships (profile_id)
  where status = 'active';

create index club_memberships_profile_id_idx on public.club_memberships (profile_id);

alter table public.club_memberships enable row level security;

create policy "Users can view their own membership"
  on public.club_memberships for select
  using (auth.uid() = profile_id);

-- No INSERT/UPDATE/DELETE policy for any client role: membership can only be
-- created via join_burger_club(), which enforces terms acceptance.

-- Joins the current user into the club. Idempotent: calling it again while
-- already an active member just returns the existing membership rather than
-- erroring, so a retried/duplicate tap is safe. Requires a non-empty terms
-- version as proof of acceptance — membership cannot be activated without it.
create function public.join_burger_club(p_terms_version text)
returns public.club_memberships
language plpgsql
security definer
set search_path = public
as $$
declare
  v_membership public.club_memberships;
begin
  if auth.uid() is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  if p_terms_version is null or length(trim(p_terms_version)) = 0 then
    raise exception 'TERMS_NOT_ACCEPTED';
  end if;

  select * into v_membership
  from public.club_memberships
  where profile_id = auth.uid() and status = 'active';

  if found then
    return v_membership;
  end if;

  insert into public.club_memberships (
    profile_id, status, joined_at, terms_accepted_at, terms_version
  )
  values (auth.uid(), 'active', now(), now(), p_terms_version)
  returning * into v_membership;

  insert into public.audit_logs (action, actor_profile_id, target_id, metadata)
  values (
    'club_membership_joined',
    auth.uid(),
    v_membership.id,
    jsonb_build_object('terms_version', p_terms_version)
  );

  return v_membership;
end;
$$;

revoke execute on function public.join_burger_club(text) from public;
grant execute on function public.join_burger_club(text) to authenticated;

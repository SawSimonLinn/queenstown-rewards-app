-- Shared helper functions used by RLS policies across later migrations.
-- Kept as regular (non SECURITY DEFINER) functions: they read profiles.role
-- for the CURRENT user only, which that user's own "view own profile" RLS
-- policy (from the Phase 6 migration) already permits.

create function public.current_user_role()
returns public.user_role
language sql
stable
security invoker
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.is_staff_or_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('staff', 'admin'), false);
$$;

create function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

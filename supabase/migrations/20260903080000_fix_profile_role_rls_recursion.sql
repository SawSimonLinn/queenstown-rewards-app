-- Phase 11's "Staff and admins can view all profiles" policy (migration
-- 20260902162000) calls public.is_staff_or_admin(), which reads
-- profiles.role for the current user. Because that policy lives on
-- `profiles` itself, evaluating it re-triggers `profiles`' own RLS, which
-- evaluates the same policy again — infinite recursion, surfaced to clients
-- as Postgres error 54001 "stack depth limit exceeded" on *any* table whose
-- RLS policies call is_staff_or_admin() / is_admin() (burger_campaigns,
-- specials, locations, redemptions, etc. — effectively the whole app).
--
-- Fix: make the role-lookup function SECURITY DEFINER so it bypasses RLS
-- when reading profiles, instead of re-entering it. This is safe — the
-- function is `stable` and hardcoded to `where id = auth.uid()`, so it only
-- ever returns the calling user's own role, exactly what their "view own
-- profile" policy already permitted before Phase 11 added the recursive
-- one. No new data becomes readable through this function.
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

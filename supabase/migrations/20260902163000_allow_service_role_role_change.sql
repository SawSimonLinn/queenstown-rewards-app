-- Phase 6's role-protection trigger unconditionally reset `role` on every
-- update, which also blocked the legitimate admin-dashboard staff-creation
-- flow (Phase 11), which runs server-side with the service-role key.
-- auth.uid() is null in that context (the service-role key carries no
-- impersonated user), so this narrows the protection to real user JWTs —
-- customers still can never elevate their own role.
create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    new.role := old.role;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

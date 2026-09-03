-- Defensive fallback for the (expected to be rare) case where an
-- authenticated user has no profiles row yet — e.g. a row created before the
-- on_auth_user_created trigger existed, or a client retry racing the trigger.
-- Mirrors handle_new_user()'s insert shape exactly. Client code only calls
-- this when a normal `select` on profiles comes back empty; the trigger
-- remains the primary, sufficient path for every new signup.

create function public.ensure_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_row public.profiles;
begin
  select * into profile_row from public.profiles where id = auth.uid();

  if not found then
    insert into public.profiles (id, full_name, email)
    select
      auth.uid(),
      coalesce(u.raw_user_meta_data ->> 'full_name', ''),
      u.email
    from auth.users u
    where u.id = auth.uid()
    returning * into profile_row;
  end if;

  return profile_row;
end;
$$;

grant execute on function public.ensure_profile() to authenticated;

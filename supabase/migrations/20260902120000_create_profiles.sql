-- Phase 6 prerequisite: minimal `profiles` table so Supabase Auth signup can
-- create a profile row. The full schema (locations, burger_campaigns,
-- monthly_entitlements, redemptions, etc.) is built in Phase 7 as separate
-- migrations; `preferred_location_id` and its foreign key are added then,
-- once the `locations` table exists.
--
-- HOW TO APPLY: paste this file into your Supabase project's
-- SQL Editor (https://supabase.com/dashboard/project/_/sql/new) and run it,
-- or apply via the Supabase CLI (`supabase db push`) if you've linked this
-- repo to your project.

create type public.user_role as enum ('customer', 'staff', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per registered customer/staff/admin, keyed to auth.users.';

-- Row Level Security: customers may only read/update their own row.
-- There is deliberately no INSERT or role-change policy for clients —
-- profile rows are created by the trigger below, and role changes are a
-- staff/admin operation to be added via a secure function in Phase 11.
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Prevent a customer from granting themselves staff/admin via the update
-- policy above: force `role` back to its previous value on any client update.
create function public.prevent_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.role := old.role;
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row
  execute function public.prevent_profile_role_change();

-- Auto-create a profile row whenever a new Supabase Auth user signs up.
-- `full_name` is read from the signup call's options.data.full_name.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

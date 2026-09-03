-- Phase 11: the admin dashboard's customer list/eligibility management
-- needs staff/admin to see customer profiles (name, email). Phase 6 only
-- allowed a user to view their own profile.
create policy "Staff and admins can view all profiles"
  on public.profiles for select
  using (public.is_staff_or_admin());

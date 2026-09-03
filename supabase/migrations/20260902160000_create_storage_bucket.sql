-- Storage bucket for Burger of the Month and specials images, uploaded by
-- staff/admin via the Phase 11 admin dashboard. Public read (these are
-- marketing images shown to every customer), staff/admin write.

insert into storage.buckets (id, name, public)
values ('public-images', 'public-images', true)
on conflict (id) do nothing;

create policy "Anyone can view public images"
  on storage.objects for select
  using (bucket_id = 'public-images');

create policy "Staff and admins can upload public images"
  on storage.objects for insert
  with check (bucket_id = 'public-images' and public.is_staff_or_admin());

create policy "Staff and admins can update public images"
  on storage.objects for update
  using (bucket_id = 'public-images' and public.is_staff_or_admin())
  with check (bucket_id = 'public-images' and public.is_staff_or_admin());

create policy "Staff and admins can delete public images"
  on storage.objects for delete
  using (bucket_id = 'public-images' and public.is_staff_or_admin());

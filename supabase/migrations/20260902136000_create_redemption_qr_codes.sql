create table public.redemption_qr_codes (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations (id) on delete cascade,
  campaign_id uuid not null references public.burger_campaigns (id) on delete cascade,
  -- Opaque, unguessable token embedded in the printed QR code — never the
  -- entitlement id or any customer data. Verified server-side in Phase 9.
  token text not null unique,
  is_active boolean not null default true,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

comment on table public.redemption_qr_codes is
  'Server-generated redemption QR tokens. Never readable by the mobile client directly — scanned tokens are validated through a secure function (Phase 9), not a direct table query.';

create index redemption_qr_codes_location_id_idx on public.redemption_qr_codes (location_id);
create index redemption_qr_codes_campaign_id_idx on public.redemption_qr_codes (campaign_id);
create index redemption_qr_codes_token_idx on public.redemption_qr_codes (token);

alter table public.redemption_qr_codes enable row level security;

create policy "Staff and admins can view QR codes"
  on public.redemption_qr_codes for select
  using (public.is_staff_or_admin());

create policy "Staff and admins can manage QR codes"
  on public.redemption_qr_codes for all
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

-- Deliberately no SELECT policy for ordinary customers: a scanned QR
-- payload is validated through a SECURITY DEFINER function (Phase 9), which
-- bypasses RLS internally — the client never queries this table directly,
-- so a copied or guessed token can't be checked against it from the app.

-- The Phase 7 unique constraint on entitlement_id blocked a *cancelled*
-- request from ever being retried, since it didn't distinguish status. A
-- partial unique index still guarantees at most one ACTIVE (pending or
-- confirmed) redemption per entitlement — the core anti-double-redemption
-- guarantee — while allowing a customer to cancel and rescan.
alter table public.redemptions drop constraint redemptions_entitlement_id_key;

create unique index redemptions_entitlement_id_active_key
  on public.redemptions (entitlement_id)
  where status <> 'cancelled';

-- A new enum value can't be added and used in the same transaction, so this
-- is its own migration, same as 20260902150000_add_redemption_confirmed_audit_action.sql.
alter type public.audit_action add value 'club_membership_joined';

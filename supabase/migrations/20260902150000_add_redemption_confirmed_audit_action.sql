-- Staff confirming a redemption is its own distinct, audited event,
-- separate from the request being created.
alter type public.audit_action add value 'redemption_confirmed';

-- The "Recently viewed" Home screen section was removed (client no longer
-- reads or writes this table — see 20260903096000_create_recently_viewed_locations.sql
-- for the original feature). Dropping the table also drops its index and RLS
-- policies.

drop table if exists public.recently_viewed_locations;

// Burger of the Month Club membership. Joining is an explicit action, gated
// server-side by the join_burger_club() SECURITY DEFINER function defined in
// supabase/migrations/20260903091000_create_club_memberships.sql — a
// customer has no direct write access to club_memberships.

import { supabase } from '@/lib/supabase';
import { mapClubMembershipRow, type ClubMembershipRow } from '@/lib/supabase/mappers';
import type { ClubMembership } from '@/types';

/** Bumping this forces re-acceptance the next time terms materially change. */
export const CLUB_TERMS_VERSION = '2026-09-03';

export async function getMyClubMembership(): Promise<ClubMembership | null> {
  const { data, error } = await supabase
    .from('club_memberships')
    .select('*')
    .eq('status', 'active')
    .maybeSingle();
  if (error) throw error;
  return data ? mapClubMembershipRow(data as ClubMembershipRow) : null;
}

export async function joinBurgerClub(): Promise<ClubMembership> {
  const { data, error } = await supabase.rpc('join_burger_club', {
    p_terms_version: CLUB_TERMS_VERSION,
  });
  if (error) throw error;
  return mapClubMembershipRow(data as ClubMembershipRow);
}

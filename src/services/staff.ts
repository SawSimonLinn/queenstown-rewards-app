import { supabase } from '@/lib/supabase';
import type { RedemptionStatus } from '@/types';

/**
 * Supabase location ids this staff member is actively assigned to. RLS
 * ("Staff can view their own staff record") already scopes this to the
 * caller's own rows, so no explicit profile_id filter is needed. Empty for
 * an admin who has no staff_members rows of their own.
 */
export async function getMyActiveStaffLocationIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from('staff_members')
    .select('location_id')
    .eq('is_active', true);
  if (error) throw error;
  return (data ?? []).map((row) => row.location_id as string);
}

export type StaffLocationOption = { id: string; name: string };

/**
 * Locations to offer in the Requests screen's location filter — the
 * caller's own assigned location(s) if they have any (typical staff, often
 * exactly one), otherwise every location (admins, who have no staff_members
 * rows of their own but can see every redemption via RLS).
 */
export async function getMyStaffLocationOptions(): Promise<StaffLocationOption[]> {
  const myLocationIds = await getMyActiveStaffLocationIds();

  let query = supabase.from('locations').select('id, name').order('name', { ascending: true });
  if (myLocationIds.length > 0) {
    query = query.in('id', myLocationIds);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as StaffLocationOption[];
}

export type StaffRedemption = {
  id: string;
  status: RedemptionStatus;
  redeemedAt: string;
  campaignName: string;
  locationName: string;
  customerName: string;
  customerEmail: string;
};

type StaffRedemptionRow = {
  id: string;
  status: RedemptionStatus;
  redeemed_at: string;
  locations: { name: string } | null;
  monthly_entitlements: { burger_campaigns: { name: string } | null } | null;
  profiles: { full_name: string; email: string } | null;
};

function mapStaffRedemptionRow(row: StaffRedemptionRow): StaffRedemption {
  return {
    id: row.id,
    status: row.status,
    redeemedAt: row.redeemed_at,
    campaignName: row.monthly_entitlements?.burger_campaigns?.name ?? 'Burger of the Month',
    locationName: row.locations?.name ?? 'Unknown location',
    customerName: row.profiles?.full_name ?? 'Unknown customer',
    customerEmail: row.profiles?.email ?? '',
  };
}

/**
 * Shared query behind both the Requests and History lists. `filterLocationId`
 * (from the Requests screen's location picker) always wins when set; absent
 * that, staff are scoped to their own assigned location(s) client-side (RLS
 * itself already permits any staff/admin to read every row — this is a
 * cleaner-list narrowing, not a security boundary. See
 * getMyActiveStaffLocationIds).
 */
async function queryStaffRedemptions(
  statuses: RedemptionStatus[],
  filterLocationId: string | null,
  order: 'oldest-first' | 'newest-first'
): Promise<StaffRedemption[]> {
  let query = supabase
    .from('redemptions')
    .select(
      'id, status, redeemed_at, locations(name), monthly_entitlements(burger_campaigns(name)), profiles(full_name, email)'
    )
    .in('status', statuses)
    .order('redeemed_at', { ascending: order === 'oldest-first' });

  if (filterLocationId) {
    query = query.eq('location_id', filterLocationId);
  } else {
    const myLocationIds = await getMyActiveStaffLocationIds();
    if (myLocationIds.length > 0) {
      query = query.in('location_id', myLocationIds);
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as unknown as StaffRedemptionRow[]).map(mapStaffRedemptionRow);
}

/** Pending redemptions this staff member can confirm, optionally narrowed to one location. */
export async function getPendingRedemptions(
  filterLocationId: string | null = null
): Promise<StaffRedemption[]> {
  return queryStaffRedemptions(['pending_staff_confirmation'], filterLocationId, 'oldest-first');
}

/** Past confirmed/cancelled/corrected redemptions, most recent first, optionally narrowed to one location. */
export async function getRedemptionHistoryForStaff(
  filterLocationId: string | null = null
): Promise<StaffRedemption[]> {
  return queryStaffRedemptions(
    ['confirmed', 'cancelled', 'corrected'],
    filterLocationId,
    'newest-first'
  );
}

export async function confirmRedemption(redemptionId: string): Promise<void> {
  const { error } = await supabase.rpc('confirm_redemption', { p_redemption_id: redemptionId });
  if (error) throw error;
}

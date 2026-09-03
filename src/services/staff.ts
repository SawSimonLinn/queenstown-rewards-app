import { supabase } from '@/lib/supabase';

export type PendingRedemption = {
  id: string;
  redeemedAt: string;
  campaignName: string;
  locationName: string;
  customerName: string;
  customerEmail: string;
};

/**
 * Pending redemptions this staff member can confirm. Admins see every
 * pending redemption; staff see only the ones at their assigned location(s).
 * RLS already restricts read access to staff/admin — this adds the
 * location scoping on top, client-side, for a cleaner list.
 */
export async function getPendingRedemptions(): Promise<PendingRedemption[]> {
  const { data: staffRows, error: staffError } = await supabase
    .from('staff_members')
    .select('location_id')
    .eq('is_active', true);
  if (staffError) throw staffError;

  const locationIds = (staffRows ?? []).map((row) => row.location_id);

  let query = supabase
    .from('redemptions')
    .select(
      'id, redeemed_at, locations(name), monthly_entitlements(burger_campaigns(name)), profiles(full_name, email)'
    )
    .eq('status', 'pending_staff_confirmation')
    .order('redeemed_at', { ascending: true });

  // Admins (no staff_members rows of their own) see everything; staff see
  // only their assigned location(s).
  if (locationIds.length > 0) {
    query = query.in('location_id', locationIds);
  }

  const { data, error } = await query;
  if (error) throw error;

  type PendingRedemptionRow = {
    id: string;
    redeemed_at: string;
    locations: { name: string } | null;
    monthly_entitlements: { burger_campaigns: { name: string } | null } | null;
    profiles: { full_name: string; email: string } | null;
  };

  return ((data ?? []) as unknown as PendingRedemptionRow[]).map((row) => ({
    id: row.id,
    redeemedAt: row.redeemed_at,
    campaignName: row.monthly_entitlements?.burger_campaigns?.name ?? 'Burger of the Month',
    locationName: row.locations?.name ?? 'Unknown location',
    customerName: row.profiles?.full_name ?? 'Unknown customer',
    customerEmail: row.profiles?.email ?? '',
  }));
}

export async function confirmRedemption(redemptionId: string): Promise<void> {
  const { error } = await supabase.rpc('confirm_redemption', { p_redemption_id: redemptionId });
  if (error) throw error;
}

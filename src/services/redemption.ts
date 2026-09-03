// Calls the secure, atomic redemption functions defined in the Phase 9
// migrations (supabase/migrations/20260902152000_create_redemption_functions.sql).
// All validation — QR genuineness, expiry, location match, entitlement
// eligibility, duplicate prevention — happens server-side; this file only
// translates the function's result/errors into a typed shape for the UI.

import { supabase } from '@/lib/supabase';
import { toRedemptionError } from '@/lib/redemption-errors';
import type { RedemptionStatus } from '@/types';

export type { RedemptionErrorCode } from '@/lib/redemption-errors';
export { RedemptionError } from '@/lib/redemption-errors';

export type RedemptionRequestSuccess = {
  redemptionId: string;
  campaignId: string;
  campaignName: string;
  locationId: string;
  locationName: string;
  status: RedemptionStatus;
};

export async function requestRedemption(
  token: string,
  locationId: string
): Promise<RedemptionRequestSuccess> {
  const { data, error } = await supabase.rpc('request_redemption', {
    p_token: token,
    p_location_id: locationId,
  });
  if (error) throw toRedemptionError(error);

  return {
    redemptionId: data.redemption_id,
    campaignId: data.campaign_id,
    campaignName: data.campaign_name,
    locationId: data.location_id,
    locationName: data.location_name,
    status: data.status,
  };
}

export async function cancelPendingRedemption(redemptionId: string): Promise<void> {
  const { error } = await supabase.rpc('cancel_pending_redemption', {
    p_redemption_id: redemptionId,
  });
  if (error) throw toRedemptionError(error);
}

/** Polled from the review screen while a redemption is awaiting staff confirmation. */
export async function getRedemptionStatus(redemptionId: string): Promise<RedemptionStatus | null> {
  const { data, error } = await supabase
    .from('redemptions')
    .select('status')
    .eq('id', redemptionId)
    .maybeSingle();
  if (error) throw error;
  return (data as { status: RedemptionStatus } | null)?.status ?? null;
}

export type RedemptionHistoryItem = {
  id: string;
  campaignName: string;
  locationName: string;
  status: RedemptionStatus;
  redeemedAt: string;
};

type RedemptionHistoryRow = {
  id: string;
  status: RedemptionStatus;
  redeemed_at: string;
  locations: { name: string } | null;
  monthly_entitlements: { burger_campaigns: { name: string } | null } | null;
};

/**
 * A customer's own past redemptions, most recent first. Relies on the
 * "Customers can view their own redemption history" RLS policy defined in
 * supabase/migrations/20260902137000_create_redemptions.sql.
 */
export async function getMyRedemptionHistory(): Promise<RedemptionHistoryItem[]> {
  const { data, error } = await supabase
    .from('redemptions')
    .select(
      'id, status, redeemed_at, locations(name), monthly_entitlements(burger_campaigns(name))'
    )
    .order('redeemed_at', { ascending: false });
  if (error) throw error;

  return ((data ?? []) as unknown as RedemptionHistoryRow[]).map((row) => ({
    id: row.id,
    campaignName: row.monthly_entitlements?.burger_campaigns?.name ?? 'Burger of the Month',
    locationName: row.locations?.name ?? 'Queenstown location',
    status: row.status,
    redeemedAt: row.redeemed_at,
  }));
}

import { supabase } from '@/lib/supabase';
import { mapEntitlementRow, type MonthlyEntitlementRow } from '@/lib/supabase/mappers';
import type { MonthlyEntitlement } from '@/types';

/**
 * Gets (or lazily creates) the current customer's entitlement for a
 * campaign's current eligible month, via the get_or_create_current_entitlement
 * SECURITY DEFINER function — a customer has no direct write access to
 * monthly_entitlements, so this is the only way to obtain one.
 */
export async function getOrCreateCurrentEntitlement(
  campaignId: string
): Promise<MonthlyEntitlement> {
  const { data, error } = await supabase.rpc('get_or_create_current_entitlement', {
    p_campaign_id: campaignId,
  });
  if (error) throw error;
  return mapEntitlementRow(data as MonthlyEntitlementRow);
}

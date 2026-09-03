// Burger of the Month detail data access, fully backed by Supabase.

import { supabase } from '@/lib/supabase';
import {
  mapBurgerCampaignRow,
  mapLocationRow,
  type BurgerCampaignRow,
  type LocationRow,
} from '@/lib/supabase/mappers';
import { getOrCreateCurrentEntitlement } from '@/services/entitlements';
import type { BurgerCampaign, Location, MonthlyEntitlement } from '@/types';

export interface BurgerCampaignDetail {
  campaign: BurgerCampaign;
  entitlement: MonthlyEntitlement | null;
  participatingLocations: Location[];
}

export async function getBurgerCampaignDetail(
  campaignId: string
): Promise<BurgerCampaignDetail | null> {
  const { data: campaignRow, error: campaignError } = await supabase
    .from('burger_campaigns')
    .select('*')
    .eq('id', campaignId)
    .maybeSingle();
  if (campaignError) throw campaignError;
  if (!campaignRow) return null;

  const { data: locationRows, error: locationsError } = await supabase
    .from('campaign_locations')
    .select('locations(*)')
    .eq('campaign_id', campaignId);
  if (locationsError) throw locationsError;

  const participatingLocations = (
    (locationRows ?? []) as unknown as { locations: LocationRow | null }[]
  )
    .map((row) => row.locations)
    .filter((location): location is LocationRow => location != null)
    .map(mapLocationRow);

  const campaign = mapBurgerCampaignRow(
    campaignRow as BurgerCampaignRow,
    participatingLocations.map((location) => location.id)
  );

  return {
    campaign,
    entitlement: await getOrCreateCurrentEntitlement(campaign.id),
    participatingLocations,
  };
}

export async function getActiveBurgerCampaign(): Promise<BurgerCampaign | null> {
  const { data, error } = await supabase
    .from('burger_campaigns')
    .select('*')
    .eq('status', 'active')
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapBurgerCampaignRow(data as BurgerCampaignRow) : null;
}

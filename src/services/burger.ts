// Burger of the Month detail data access, fully backed by Supabase.

import { supabase } from '@/lib/supabase';
import {
  mapBurgerCampaignRow,
  mapLocationRow,
  type BurgerCampaignRow,
  type LocationRow,
} from '@/lib/supabase/mappers';
import { getOrCreateCurrentEntitlement } from '@/services/entitlements';
import type { BurgerCampaign, CampaignStatus, Location, MonthlyEntitlement } from '@/types';

export interface BurgerCampaignDetail {
  campaign: BurgerCampaign;
  entitlement: MonthlyEntitlement | null;
  participatingLocations: Location[];
}

export interface CampaignWithLocations {
  campaign: BurgerCampaign;
  participatingLocations: Location[];
}

/**
 * Campaign + participating locations, with no entitlement side effect —
 * used by the staff edit form, which must be able to load ANY campaign
 * (including ones the staff member isn't personally entitled to) without
 * tripping get_or_create_current_entitlement's club-membership requirement.
 */
export async function getCampaignForStaff(campaignId: string): Promise<CampaignWithLocations | null> {
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

  return { campaign, participatingLocations };
}

export async function getBurgerCampaignDetail(
  campaignId: string
): Promise<BurgerCampaignDetail | null> {
  const result = await getCampaignForStaff(campaignId);
  if (!result) return null;

  return {
    ...result,
    entitlement: await getOrCreateCurrentEntitlement(result.campaign.id),
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

/** Every campaign regardless of status — for staff/admin management, gated by RLS's "or is_staff_or_admin()" clause. */
export async function getAllCampaigns(): Promise<BurgerCampaign[]> {
  const { data, error } = await supabase
    .from('burger_campaigns')
    .select('*')
    .order('start_date', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as BurgerCampaignRow[]).map((row) => mapBurgerCampaignRow(row));
}

export type CampaignInput = {
  name: string;
  description: string;
  imageUrl: string | null;
  termsAndRestrictions: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
};

function toCampaignRowInput(input: CampaignInput) {
  return {
    name: input.name,
    description: input.description,
    image_url: input.imageUrl,
    terms_and_restrictions: input.termsAndRestrictions,
    start_date: input.startDate,
    end_date: input.endDate,
    status: input.status,
  };
}

/** Staff/admin only — enforced by RLS ("Staff and admins can manage campaigns"). */
export async function createCampaign(input: CampaignInput): Promise<BurgerCampaign> {
  const { data, error } = await supabase
    .from('burger_campaigns')
    .insert(toCampaignRowInput(input))
    .select('*')
    .single();
  if (error) throw error;
  return mapBurgerCampaignRow(data as BurgerCampaignRow);
}

export async function updateCampaign(
  campaignId: string,
  input: CampaignInput
): Promise<BurgerCampaign> {
  const { data, error } = await supabase
    .from('burger_campaigns')
    .update(toCampaignRowInput(input))
    .eq('id', campaignId)
    .select('*')
    .single();
  if (error) throw error;
  return mapBurgerCampaignRow(data as BurgerCampaignRow);
}

export async function deleteCampaign(campaignId: string): Promise<void> {
  const { error } = await supabase.from('burger_campaigns').delete().eq('id', campaignId);
  if (error) throw error;
}

/** Replaces every campaign_locations row for this campaign with `locationIds`. */
export async function replaceCampaignLocations(
  campaignId: string,
  locationIds: string[]
): Promise<void> {
  const { error: deleteError } = await supabase
    .from('campaign_locations')
    .delete()
    .eq('campaign_id', campaignId);
  if (deleteError) throw deleteError;

  if (locationIds.length === 0) return;

  const { error: insertError } = await supabase
    .from('campaign_locations')
    .insert(locationIds.map((locationId) => ({ campaign_id: campaignId, location_id: locationId })));
  if (insertError) throw insertError;
}

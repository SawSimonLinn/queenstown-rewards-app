// Home screen data access. Burger of the Month + entitlement remain fully
// backed by Supabase; location data comes from the local, typed Queenstown
// Hospitality Group dataset (src/data/locations.ts) — see AGENTS.md for why.

import { getActiveBurgerCampaign } from '@/services/burger';
import { getOrCreateCurrentEntitlement } from '@/services/entitlements';
import { getSpecials } from '@/services/specials';
import type { BurgerCampaign, MonthlyEntitlement, Special } from '@/types';

export interface HomeScreenData {
  campaign: BurgerCampaign | null;
  entitlement: MonthlyEntitlement | null;
  specials: Special[];
}

export async function getHomeScreenData(): Promise<HomeScreenData> {
  const [campaign, specials] = await Promise.all([getActiveBurgerCampaign(), getSpecials()]);

  // A failure here (e.g. the Phase 9 migrations not applied yet) shouldn't
  // blank out the whole Home screen when the public content above loaded fine.
  let entitlement: MonthlyEntitlement | null = null;
  if (campaign) {
    try {
      entitlement = await getOrCreateCurrentEntitlement(campaign.id);
    } catch (error) {
      console.error('Could not load entitlement:', error);
    }
  }

  return { campaign, entitlement, specials };
}

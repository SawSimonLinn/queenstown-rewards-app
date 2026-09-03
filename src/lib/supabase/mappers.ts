// Maps snake_case Supabase rows onto the app's camelCase domain types
// (src/types/index.ts). Kept as a small boundary layer so the rest of the
// app never has to think about the database's column naming.

import type {
  BurgerCampaign,
  CampaignStatus,
  EntitlementStatus,
  Location,
  MonthlyEntitlement,
  OpeningHours,
  Profile,
  Special,
  UserRole,
} from '@/types';

export type LocationRow = {
  id: string;
  name: string;
  address: string;
  suburb: string;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  opening_hours: OpeningHours;
  is_participating: boolean;
  created_at: string;
  updated_at: string;
};

export function mapLocationRow(row: LocationRow): Location {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    suburb: row.suburb,
    phone: row.phone,
    latitude: row.latitude,
    longitude: row.longitude,
    openingHours: row.opening_hours,
    isParticipating: row.is_participating,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type BurgerCampaignRow = {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  terms_and_restrictions: string;
  start_date: string;
  end_date: string;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
};

export function mapBurgerCampaignRow(
  row: BurgerCampaignRow,
  participatingLocationIds: string[] = []
): BurgerCampaign {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    termsAndRestrictions: row.terms_and_restrictions,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    participatingLocationIds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type SpecialRow = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
};

export function mapSpecialRow(row: SpecialRow, locationIds: string[] = []): Special {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    startDate: row.start_date,
    endDate: row.end_date,
    locationIds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type MonthlyEntitlementRow = {
  id: string;
  profile_id: string;
  campaign_id: string;
  period_month: string;
  status: EntitlementStatus;
  created_at: string;
  redeemed_at: string | null;
};

export function mapEntitlementRow(row: MonthlyEntitlementRow): MonthlyEntitlement {
  return {
    id: row.id,
    profileId: row.profile_id,
    campaignId: row.campaign_id,
    periodMonth: row.period_month.slice(0, 7),
    status: row.status,
    createdAt: row.created_at,
    redeemedAt: row.redeemed_at,
  };
}

export type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  preferred_location_id: string | null;
  created_at: string;
  updated_at: string;
};

export function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    preferredLocationId: row.preferred_location_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

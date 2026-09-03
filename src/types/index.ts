// Shared domain types for Queenstown Rewards.
// These mirror the planned Supabase schema (Phase 7) and are used across
// the app before and after real data replaces local sample data.

export type UUID = string;
export type ISODateString = string;

export type UserRole = 'customer' | 'staff' | 'admin';

export interface Profile {
  id: UUID;
  fullName: string;
  email: string;
  role: UserRole;
  preferredLocationId: UUID | null;
  onboardingCompletedAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Location {
  id: UUID;
  name: string;
  address: string;
  suburb: string;
  /** Not every location has a verified phone number on file. */
  phone: string | null;
  /** No verified coordinates on file yet. */
  latitude: number | null;
  longitude: number | null;
  openingHours: OpeningHours;
  isParticipating: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface OpeningHours {
  monday: DayHours | null;
  tuesday: DayHours | null;
  wednesday: DayHours | null;
  thursday: DayHours | null;
  friday: DayHours | null;
  saturday: DayHours | null;
  sunday: DayHours | null;
}

export interface DayHours {
  open: string; // e.g. "11:00"
  close: string; // e.g. "21:00"
}

export type StaffPermission =
  'confirm_redemptions' | 'manage_specials' | 'manage_campaigns' | 'manage_locations';

export interface StaffMember {
  id: UUID;
  profileId: UUID;
  locationId: UUID;
  permissions: StaffPermission[];
  isActive: boolean;
  createdAt: ISODateString;
}

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'expired';

export interface BurgerCampaign {
  id: UUID;
  name: string;
  description: string;
  imageUrl: string | null;
  termsAndRestrictions: string;
  startDate: ISODateString;
  endDate: ISODateString;
  status: CampaignStatus;
  participatingLocationIds: UUID[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type EntitlementStatus = 'eligible' | 'redeemed' | 'expired' | 'ineligible';

export interface MonthlyEntitlement {
  id: UUID;
  profileId: UUID;
  campaignId: UUID;
  periodMonth: string; // e.g. "2026-09"
  status: EntitlementStatus;
  createdAt: ISODateString;
  redeemedAt: ISODateString | null;
}

export interface RedemptionQrCode {
  id: UUID;
  locationId: UUID;
  campaignId: UUID;
  token: string; // opaque, server-verifiable, never the raw entitlement id
  isActive: boolean;
  expiresAt: ISODateString;
  createdAt: ISODateString;
}

export type RedemptionStatus =
  'pending_staff_confirmation' | 'confirmed' | 'cancelled' | 'corrected';

export interface Redemption {
  id: UUID;
  entitlementId: UUID;
  profileId: UUID;
  locationId: UUID;
  staffMemberId: UUID | null;
  status: RedemptionStatus;
  redeemedAt: ISODateString;
  createdAt: ISODateString;
}

export interface Special {
  id: UUID;
  title: string;
  description: string;
  imageUrl: string | null;
  startDate: ISODateString;
  endDate: ISODateString;
  locationIds: UUID[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface PushToken {
  id: UUID;
  profileId: UUID;
  token: string;
  platform: 'ios' | 'android' | 'web';
  createdAt: ISODateString;
}

export type NotificationCampaignStatus = 'draft' | 'scheduled' | 'sent';

export interface NotificationCampaign {
  id: UUID;
  title: string;
  body: string;
  scheduledFor: ISODateString | null;
  status: NotificationCampaignStatus;
  deepLink: string | null;
  createdAt: ISODateString;
}

export type NotificationType = 'burger_drop' | 'special_offer' | 'account_update' | 'redemption';

export interface AppNotification {
  id: UUID;
  profileId: UUID;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  readAt: ISODateString | null;
  createdAt: ISODateString;
}

export type ClubMembershipStatus = 'active' | 'cancelled';

export interface ClubMembership {
  id: UUID;
  profileId: UUID;
  status: ClubMembershipStatus;
  joinedAt: ISODateString;
  termsAcceptedAt: ISODateString;
  termsVersion: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type AuditAction =
  | 'redemption_created'
  | 'redemption_corrected'
  | 'redemption_cancelled'
  | 'entitlement_created'
  | 'campaign_created'
  | 'campaign_updated'
  | 'special_created'
  | 'special_updated'
  | 'staff_permission_changed';

export interface AuditLog {
  id: UUID;
  action: AuditAction;
  actorProfileId: UUID;
  targetId: UUID;
  metadata: Record<string, unknown>;
  createdAt: ISODateString;
}

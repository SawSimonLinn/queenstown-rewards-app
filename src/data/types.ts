// Types for the local, typed Queenstown Hospitality Group location dataset
// (src/data/locations.ts). Deliberately separate from the Supabase-oriented
// `Location`/`OpeningHours` types in src/types/index.ts, which remain in use
// wherever specials/burger campaigns still join against the Supabase
// `locations` table. This dataset exists so the Locations tab and Burger of
// the Month Club experience can ship with real, verified restaurant data
// before that data is migrated into Supabase.

export type DayOfWeek =
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

/** 24-hour "HH:MM" time-of-day, always interpreted in `timezone` (America/Los_Angeles). */
export type TimeString = string;

export type ServicePeriod = {
  /** e.g. "Brunch", "Lunch", "Dinner". Omitted for a simple single-period day. */
  label?: string;
  open: TimeString;
  /**
   * `null` means the closing time is not confirmed — e.g. "dinner, 3:00 PM
   * to close". Never invent a closing time to fill this in: render it as
   * "to close" and never compute a "closing soon" state from it.
   */
  close: TimeString | null;
};

/** A day's schedule: `null` means closed all day; otherwise one or more service periods. */
export type DaySchedule = { periods: ServicePeriod[] } | null;

export type WeeklyHours = Record<DayOfWeek, DaySchedule>;

/**
 * A cross-cutting service window layered on top of the primary weekly
 * schedule — e.g. a daily happy hour, or an all-day happy hour on one
 * specific day. Informational only; it does not drive open/closed status.
 */
export type ServiceHours = {
  id: string;
  label: string;
  days: DayOfWeek[];
  open: TimeString;
  close: TimeString | null;
  note?: string;
};

/**
 * A geocoded point, verified from an approved mapping/geocoding source (not
 * invented). `precision` flags when the point resolves to a shared building
 * (e.g. a mall address) rather than the restaurant's own storefront — still
 * accurate enough for a map marker, just not a rooftop-exact pin.
 */
export type VerifiedCoordinates = {
  latitude: number;
  longitude: number;
  precision: 'rooftop' | 'building';
};

export type RestaurantLocation = {
  id: string;
  name: string;
  shortName: string;
  neighbourhood: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  phone?: string;
  website?: string;
  /**
   * `null` when the coordinates could not be verified from an approved
   * source — the map must skip this location's marker rather than guess.
   */
  coordinates: VerifiedCoordinates | null;
  /** ISO date the coordinates above were last verified against their source. */
  coordinatesVerifiedAt: string | null;
  /** All schedule data is authored and evaluated in this IANA timezone, regardless of device locale. */
  timezone: 'America/Los_Angeles';
  weeklyHours: WeeklyHours;
  specialServiceHours?: ServiceHours[];
  /**
   * `true` when hours could not be confirmed from an official source
   * (e.g. Del Mar). When set, no open/closed status is computed — the UI
   * must show an "hours awaiting confirmation" message instead.
   */
  hoursUnconfirmed?: boolean;
  currentlyParticipating: boolean;
  description: string;
  features: string[];
  /** Internal maintenance metadata — not shown to customers. */
  sourceUrl?: string;
  lastVerifiedAt: string;
  /** `partially_verified` when some details (e.g. hours) are still awaiting confirmation from an official source. */
  informationStatus: 'verified' | 'partially_verified';
};

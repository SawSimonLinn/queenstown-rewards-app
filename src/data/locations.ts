// Typed, local source of truth for Queenstown Hospitality Group locations.
// Verified against each restaurant's own website (see `sourceUrl` per
// record) as of `lastVerifiedAt`. This is intentionally NOT fetched from
// Supabase yet — see AGENTS.md and src/data/types.ts for why — but the shape
// is designed to move there directly once the group confirms/updates it.
//
// Do not scrape these websites at runtime; if a detail changes, update the
// record below and bump `lastVerifiedAt`.

import type { RestaurantLocation, ServicePeriod, TimeString } from '@/data/types';

const VERIFIED_AT = '2026-09-03';

// Coordinates geocoded from OpenStreetMap/Nominatim against each verified
// street address (or, for Westfield UTC, the mall building itself — see
// `precision: 'building'` below) on `COORDINATES_VERIFIED_AT`. Do not
// re-geocode on every app start; update these only when an address changes.
const COORDINATES_VERIFIED_AT = '2026-09-03';

const brunch = (open: TimeString, close: TimeString): ServicePeriod => ({
  label: 'Brunch',
  open,
  close,
});
const lunch = (open: TimeString, close: TimeString): ServicePeriod => ({
  label: 'Lunch',
  open,
  close,
});
const dinner = (open: TimeString, close: TimeString | null): ServicePeriod => ({
  label: 'Dinner',
  open,
  close,
});
const allDay = (open: TimeString, close: TimeString): ServicePeriod => ({ open, close });

export const QUEENSTOWN_LOCATIONS: RestaurantLocation[] = [
  {
    id: 'queenstown-public-house',
    name: 'Queenstown Public House',
    shortName: 'Little Italy',
    neighbourhood: 'Little Italy',
    addressLine1: '1557 Columbia St',
    city: 'San Diego',
    state: 'CA',
    postalCode: '92101',
    coordinates: { latitude: 32.721771, longitude: -117.167105, precision: 'rooftop' },
    coordinatesVerifiedAt: COORDINATES_VERIFIED_AT,
    website: 'https://queenstownpublichouse.com/',
    timezone: 'America/Los_Angeles',
    weeklyHours: {
      sunday: { periods: [brunch('09:00', '14:00'), dinner('15:00', null)] },
      monday: { periods: [lunch('11:00', '14:00'), dinner('15:00', null)] },
      tuesday: { periods: [lunch('11:00', '14:00'), dinner('15:00', null)] },
      wednesday: { periods: [lunch('11:00', '14:00'), dinner('15:00', null)] },
      thursday: { periods: [lunch('11:00', '14:00'), dinner('15:00', null)] },
      friday: { periods: [lunch('11:00', '14:00'), dinner('15:00', null)] },
      saturday: { periods: [brunch('09:00', '14:00'), dinner('15:00', null)] },
    },
    currentlyParticipating: true,
    informationStatus: 'verified',
    description:
      'A Little Italy neighbourhood public house serving weekend brunch, weekday lunch and dinner nightly.',
    features: ['Weekend brunch', 'Patio seating', 'Burger Club participant'],
    sourceUrl: 'https://queenstownpublichouse.com/',
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: 'queenstown-bistro-utc',
    name: 'Queenstown Bistro',
    shortName: 'UTC',
    neighbourhood: 'Westfield UTC',
    addressLine1: '4545 La Jolla Village Drive',
    addressLine2: 'Space 9028, Suite 18',
    city: 'San Diego',
    state: 'CA',
    postalCode: '92122',
    // Westfield UTC is a large mall complex; this resolves to the mall
    // building itself rather than a rooftop-exact storefront pin.
    coordinates: { latitude: 32.8712523, longitude: -117.2116325, precision: 'building' },
    coordinatesVerifiedAt: COORDINATES_VERIFIED_AT,
    phone: '(858) 623-2748',
    website: 'https://www.queenstownbistro.com/',
    timezone: 'America/Los_Angeles',
    weeklyHours: {
      sunday: { periods: [allDay('10:00', '19:00')] },
      monday: { periods: [allDay('11:00', '20:00')] },
      tuesday: { periods: [allDay('11:00', '20:00')] },
      wednesday: { periods: [allDay('11:00', '20:00')] },
      thursday: { periods: [allDay('11:00', '20:00')] },
      friday: { periods: [allDay('11:00', '21:00')] },
      saturday: { periods: [allDay('10:00', '21:00')] },
    },
    currentlyParticipating: true,
    informationStatus: 'verified',
    description: 'A bistro at Westfield UTC serving lunch through dinner seven days a week.',
    features: ['Outdoor mall seating', 'Burger Club participant'],
    sourceUrl: 'https://www.queenstownbistro.com/',
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: 'queenstown-village-la-jolla',
    name: 'Queenstown Village',
    shortName: 'La Jolla',
    neighbourhood: 'La Jolla Village',
    addressLine1: '1044 Wall Street',
    addressLine2: 'Suites C & D',
    city: 'La Jolla',
    state: 'CA',
    postalCode: '92037',
    coordinates: { latitude: 32.847221, longitude: -117.2735167, precision: 'rooftop' },
    coordinatesVerifiedAt: COORDINATES_VERIFIED_AT,
    phone: '(858) 667-7925',
    website: 'https://www.q-town.com/',
    timezone: 'America/Los_Angeles',
    weeklyHours: {
      sunday: { periods: [allDay('10:00', '21:00')] },
      monday: { periods: [allDay('11:00', '21:00')] },
      tuesday: { periods: [allDay('11:00', '21:00')] },
      wednesday: { periods: [allDay('11:00', '21:00')] },
      thursday: { periods: [allDay('11:00', '21:00')] },
      friday: { periods: [allDay('11:00', '21:00')] },
      saturday: { periods: [allDay('10:00', '21:00')] },
    },
    currentlyParticipating: true,
    informationStatus: 'verified',
    description: 'The original Queenstown Village restaurant in the heart of La Jolla Village.',
    features: ['Full bar', 'Burger Club participant'],
    sourceUrl: 'https://www.q-town.com/',
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: 'queenstown-del-mar',
    name: 'Queenstown Del Mar',
    shortName: 'Del Mar',
    neighbourhood: 'Del Mar Village',
    addressLine1: '1435 Camino Del Mar',
    addressLine2: 'Suite D',
    city: 'Del Mar',
    state: 'CA',
    postalCode: '92014',
    coordinates: { latitude: 32.959484, longitude: -117.264857, precision: 'rooftop' },
    coordinatesVerifiedAt: COORDINATES_VERIFIED_AT,
    phone: '(858) 925-5771',
    website: 'https://queenstowndelmar.com/',
    timezone: 'America/Los_Angeles',
    // Sourced from the location's Google Business listing (the official
    // website does not publish a complete weekly schedule). Monday's listed
    // hours reflected a Labor Day holiday adjustment at the time of capture —
    // regular Monday hours may differ; update if that's confirmed otherwise.
    weeklyHours: {
      sunday: { periods: [allDay('09:00', '21:00')] },
      monday: { periods: [allDay('09:00', '21:00')] },
      tuesday: { periods: [allDay('11:00', '21:00')] },
      wednesday: { periods: [allDay('11:00', '21:00')] },
      thursday: { periods: [allDay('11:00', '21:00')] },
      friday: { periods: [allDay('11:00', '22:00')] },
      saturday: { periods: [allDay('09:00', '22:00')] },
    },
    currentlyParticipating: true,
    informationStatus: 'verified',
    description: 'Queenstown’s Del Mar Village location, steps from the beach.',
    features: ['Del Mar Village', 'Burger Club participant'],
    sourceUrl: 'https://queenstowndelmar.com/',
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: 'dunedin-north-park',
    name: 'Dunedin New Zealand Eats',
    shortName: 'North Park',
    neighbourhood: 'North Park',
    addressLine1: '3501 30th Street',
    city: 'San Diego',
    state: 'CA',
    postalCode: '92104',
    coordinates: { latitude: 32.742342, longitude: -117.12986, precision: 'rooftop' },
    coordinatesVerifiedAt: COORDINATES_VERIFIED_AT,
    phone: '(619) 255-8566',
    website: 'https://www.dunedinsd.com/',
    timezone: 'America/Los_Angeles',
    weeklyHours: {
      sunday: { periods: [brunch('10:00', '14:00'), dinner('15:00', null)] },
      monday: { periods: [lunch('11:00', '14:00'), dinner('15:00', null)] },
      tuesday: { periods: [lunch('11:00', '14:00'), dinner('15:00', null)] },
      wednesday: { periods: [lunch('11:00', '14:00'), dinner('15:00', null)] },
      thursday: { periods: [lunch('11:00', '14:00'), dinner('15:00', null)] },
      friday: { periods: [lunch('10:00', '14:00'), dinner('15:00', null)] },
      saturday: { periods: [brunch('10:00', '14:00'), dinner('15:00', null)] },
    },
    specialServiceHours: [
      {
        id: 'happy-hour-daily',
        label: 'Happy Hour',
        days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        open: '15:00',
        close: '18:00',
      },
      {
        id: 'happy-hour-tuesday-all-day',
        label: 'All-Day Happy Hour',
        days: ['tuesday'],
        open: '11:00',
        close: '21:00',
        note: 'Happy hour pricing runs all day Tuesday.',
      },
    ],
    currentlyParticipating: true,
    informationStatus: 'verified',
    description:
      'New Zealand-inspired fare in North Park, with weekend brunch and daily happy hour.',
    features: ['Weekend brunch', 'Daily happy hour', 'Burger Club participant'],
    sourceUrl: 'https://www.dunedinsd.com/',
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: 'raglan-public-house',
    name: 'Raglan Public House',
    shortName: 'Ocean Beach',
    neighbourhood: 'Ocean Beach',
    addressLine1: '1851 Bacon Street',
    city: 'San Diego',
    state: 'CA',
    postalCode: '92107',
    coordinates: { latitude: 32.7460886, longitude: -117.2516134, precision: 'rooftop' },
    coordinatesVerifiedAt: COORDINATES_VERIFIED_AT,
    phone: '(619) 794-2304',
    website: 'https://raglanpublichouse.com/',
    timezone: 'America/Los_Angeles',
    weeklyHours: {
      sunday: { periods: [brunch('10:00', '14:00'), allDay('14:00', '21:00')] },
      monday: { periods: [allDay('11:00', '21:00')] },
      tuesday: { periods: [allDay('11:00', '21:00')] },
      wednesday: { periods: [allDay('11:00', '21:00')] },
      thursday: { periods: [allDay('11:00', '21:00')] },
      friday: { periods: [allDay('11:00', '22:00')] },
      saturday: { periods: [brunch('10:00', '14:00'), allDay('14:00', '22:00')] },
    },
    currentlyParticipating: true,
    informationStatus: 'verified',
    description: 'An Ocean Beach public house with weekend brunch and a full daily menu.',
    features: ['Weekend brunch', 'Steps from the beach', 'Burger Club participant'],
    sourceUrl: 'https://raglanpublichouse.com/',
    lastVerifiedAt: VERIFIED_AT,
  },
  {
    id: 'bare-back-grill',
    name: 'Bare Back Grill',
    shortName: 'Pacific Beach',
    neighbourhood: 'Pacific Beach',
    addressLine1: '4640 Mission Boulevard',
    city: 'San Diego',
    state: 'CA',
    postalCode: '92109',
    coordinates: { latitude: 32.7982408, longitude: -117.256209, precision: 'rooftop' },
    coordinatesVerifiedAt: COORDINATES_VERIFIED_AT,
    phone: '(858) 274-7117',
    website: 'https://barebackgrill.com/',
    timezone: 'America/Los_Angeles',
    weeklyHours: {
      sunday: { periods: [allDay('10:00', '21:00')] },
      monday: { periods: [allDay('11:00', '21:00')] },
      tuesday: { periods: [allDay('11:00', '21:00')] },
      wednesday: { periods: [allDay('11:00', '21:00')] },
      thursday: { periods: [allDay('11:00', '21:00')] },
      friday: { periods: [allDay('11:00', '22:00')] },
      saturday: { periods: [allDay('10:00', '22:00')] },
    },
    currentlyParticipating: true,
    informationStatus: 'verified',
    description: 'A Pacific Beach grill open daily for lunch and dinner.',
    features: ['Pacific Beach', 'Burger Club participant'],
    sourceUrl: 'https://barebackgrill.com/',
    lastVerifiedAt: VERIFIED_AT,
  },
];

export function getRestaurantLocations(): RestaurantLocation[] {
  return QUEENSTOWN_LOCATIONS;
}

export function getRestaurantLocationCount(): number {
  return QUEENSTOWN_LOCATIONS.length;
}

export function getRestaurantLocationById(id: string): RestaurantLocation | null {
  return QUEENSTOWN_LOCATIONS.find((location) => location.id === id) ?? null;
}

/** The first participating location — a sensible default before a customer picks a preferred one. */
export function getDefaultRestaurantLocation(): RestaurantLocation {
  return QUEENSTOWN_LOCATIONS[0];
}

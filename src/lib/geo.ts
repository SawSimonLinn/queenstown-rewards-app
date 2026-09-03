// Distance helpers. Distances are only ever shown when we have both a real
// device location fix and a verified restaurant coordinate — never a guess.

import type { VerifiedCoordinates } from '@/data/types';

const EARTH_RADIUS_MILES = 3958.8;

export type DeviceCoordinates = { latitude: number; longitude: number };

/** Great-circle distance in miles between two points. */
export function getDistanceMiles(a: DeviceCoordinates, b: DeviceCoordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_MILES * c;
}

export function formatDistanceMiles(miles: number): string {
  if (miles < 0.1) return 'Nearby';
  return `${miles.toFixed(miles < 10 ? 1 : 0)} mi`;
}

/** `null` when either point is unavailable — callers must hide distance in that case. */
export function getDistanceLabel(
  from: DeviceCoordinates | null,
  to: VerifiedCoordinates | null
): string | null {
  if (!from || !to) return null;
  return formatDistanceMiles(getDistanceMiles(from, to));
}

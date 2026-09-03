import { Platform } from 'react-native';

import type { RestaurantLocation } from '@/data/types';

export function getFullAddress(location: RestaurantLocation): string {
  const line2 = location.addressLine2 ? `, ${location.addressLine2}` : '';
  return `${location.addressLine1}${line2}, ${location.city}, ${location.state} ${location.postalCode}`.trim();
}

export function getDirectionsUrl(location: RestaurantLocation): string {
  const address = encodeURIComponent(getFullAddress(location));

  if (Platform.OS === 'ios') {
    return `https://maps.apple.com/?daddr=${address}`;
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${address}`;
}

export function getPhoneCallUrl(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function getWebsiteUrl(location: RestaurantLocation): string | null {
  return location.website ?? null;
}

import { Platform } from 'react-native';

import { getDirectionsUrl, getFullAddress, getPhoneCallUrl } from '@/lib/maps';
import type { RestaurantLocation } from '@/data/types';

const sampleLocation: RestaurantLocation = {
  id: 'test-location',
  name: 'Queenstown Public House',
  shortName: 'Little Italy',
  neighbourhood: 'Little Italy',
  addressLine1: '1557 Columbia St',
  city: 'San Diego',
  state: 'CA',
  postalCode: '92101',
  phone: '(858) 623-2748',
  coordinates: { latitude: 32.721771, longitude: -117.167105, precision: 'rooftop' },
  coordinatesVerifiedAt: '2026-09-03',
  timezone: 'America/Los_Angeles',
  weeklyHours: {
    sunday: null,
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
  },
  currentlyParticipating: true,
  description: 'Test',
  features: [],
  lastVerifiedAt: '2026-09-03',
  informationStatus: 'verified',
};

describe('getFullAddress', () => {
  it('joins the address parts, including suite/unit when present', () => {
    expect(getFullAddress(sampleLocation)).toBe('1557 Columbia St, San Diego, CA 92101');
    expect(getFullAddress({ ...sampleLocation, addressLine2: 'Suite D' })).toBe(
      '1557 Columbia St, Suite D, San Diego, CA 92101'
    );
  });
});

describe('getDirectionsUrl', () => {
  it('builds an Apple Maps URL on iOS with the encoded address', () => {
    Platform.OS = 'ios';
    const url = getDirectionsUrl(sampleLocation);
    expect(url).toContain('maps.apple.com');
    expect(url).toContain(encodeURIComponent('1557 Columbia St, San Diego, CA 92101'));
  });

  it('builds a Google Maps URL on Android', () => {
    Platform.OS = 'android';
    const url = getDirectionsUrl(sampleLocation);
    expect(url).toContain('google.com/maps');
  });
});

describe('getPhoneCallUrl', () => {
  it('strips non-numeric characters from the phone number', () => {
    expect(getPhoneCallUrl('(858) 623-2748')).toBe('tel:8586232748');
  });
});

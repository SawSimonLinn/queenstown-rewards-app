import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { QUEENSTOWN_LOCATIONS } from '@/data/locations';
import type { RestaurantLocation } from '@/data/types';
import { getDistanceLabel, getDistanceMiles, type DeviceCoordinates } from '@/lib/geo';
import { requestDeviceLocation } from '@/lib/location-permission';

const NEAR_YOU_COUNT = 4;

export type LocationPermissionState = 'unrequested' | 'granted' | 'denied';

/**
 * Home's "Near you" section. Never requests device location on its own —
 * `requestLocation` only runs from an explicit "Enable location" tap, and
 * always behind an in-app explanation first (see `promptAndRequestLocation`),
 * matching the Locations tab's own "Use My Location" flow
 * (src/app/(tabs)/locations.tsx).
 */
export function useNearbyLocations(preferredLocation: RestaurantLocation | null) {
  const [deviceCoords, setDeviceCoords] = useState<DeviceCoordinates | null>(null);
  const [permissionState, setPermissionState] = useState<LocationPermissionState>('unrequested');

  const locations = useMemo(() => {
    if (deviceCoords) {
      return [...QUEENSTOWN_LOCATIONS]
        .sort((a, b) => {
          if (!a.coordinates && !b.coordinates) return 0;
          if (!a.coordinates) return 1;
          if (!b.coordinates) return -1;
          return (
            getDistanceMiles(deviceCoords, a.coordinates) -
            getDistanceMiles(deviceCoords, b.coordinates)
          );
        })
        .slice(0, NEAR_YOU_COUNT);
    }

    // No device fix: preferred location first, then the dataset's existing
    // default order — never a fabricated distance/order.
    const ordered = preferredLocation
      ? [preferredLocation, ...QUEENSTOWN_LOCATIONS.filter((l) => l.id !== preferredLocation.id)]
      : QUEENSTOWN_LOCATIONS;
    return ordered.slice(0, NEAR_YOU_COUNT);
  }, [deviceCoords, preferredLocation]);

  const distanceLabelFor = useCallback(
    (location: RestaurantLocation) => getDistanceLabel(deviceCoords, location.coordinates),
    [deviceCoords]
  );

  const promptAndRequestLocation = useCallback(() => {
    Alert.alert(
      'Use your location?',
      'Queenstown Rewards will use your location to show which restaurants are closest to you.',
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Allow',
          onPress: async () => {
            const result = await requestDeviceLocation();
            if (result.granted) {
              setDeviceCoords(result.coordinates);
              setPermissionState('granted');
            } else {
              setPermissionState('denied');
            }
          },
        },
      ]
    );
  }, []);

  return { locations, distanceLabelFor, permissionState, promptAndRequestLocation };
}

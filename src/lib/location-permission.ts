// Contextual device-location access. Deliberately never called on screen
// mount — only from an explicit "Use My Location" / recenter / distance
// affordance, per the Locations redesign brief. Callers should show an
// explanatory prompt before invoking this, since the OS permission dialog
// itself gives the customer no context for why the app wants it.

import * as Location from 'expo-location';

import type { DeviceCoordinates } from '@/lib/geo';

export type LocationPermissionResult =
  | { granted: true; coordinates: DeviceCoordinates }
  | { granted: false; reason: 'denied' | 'unavailable' };

export async function requestDeviceLocation(): Promise<LocationPermissionResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { granted: false, reason: 'denied' };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      granted: true,
      coordinates: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
    };
  } catch {
    return { granted: false, reason: 'unavailable' };
  }
}

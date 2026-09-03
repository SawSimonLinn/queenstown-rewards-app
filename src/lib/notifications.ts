import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export type PushRegistrationResult =
  | { status: 'registered'; token: string }
  | { status: 'permission-denied' }
  | { status: 'unsupported-device' }
  | { status: 'no-project-id' }
  | { status: 'error'; message: string };

/**
 * Requests notification permission (if not already granted) and returns an
 * Expo push token. Call this from a user-initiated action (e.g. a toggle on
 * the Profile screen) — never automatically on launch.
 *
 * Getting a real, deliverable push token requires an EAS project id, which
 * this project doesn't have configured yet (that's set up in Phase 12).
 * Remote push delivery also isn't supported in Expo Go as of recent SDKs —
 * this will work once the app runs in a development or production build.
 */
export async function registerForPushNotificationsAsync(): Promise<PushRegistrationResult> {
  if (!Device.isDevice) {
    return { status: 'unsupported-device' };
  }

  await ensureAndroidNotificationChannel();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return { status: 'permission-denied' };
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    return { status: 'no-project-id' };
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    return { status: 'registered', token };
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

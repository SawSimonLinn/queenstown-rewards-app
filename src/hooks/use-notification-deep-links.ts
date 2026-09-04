import type { Href, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Navigates to the route named in a notification's `data.deepLink` when the
 * user taps it (whether the app was foregrounded, backgrounded, or launched
 * fresh by the tap). Notification content is set by the sender (Phase 11's
 * admin dashboard) — deepLink is treated as an app-internal path only.
 */
export function useNotificationDeepLinks(router: ReturnType<typeof useRouter>) {
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const openDeepLink = (response: Notifications.NotificationResponse | null) => {
      const deepLink = response?.notification.request.content.data?.deepLink;
      if (typeof deepLink === 'string') {
        router.push(deepLink as Href);
      }
    };

    Notifications.getLastNotificationResponseAsync()
      .then(openDeepLink)
      .catch((error) => {
        console.warn('Notification launch response unavailable:', error);
      });

    const subscription = Notifications.addNotificationResponseReceivedListener(openDeepLink);

    return () => subscription.remove();
  }, [router]);
}

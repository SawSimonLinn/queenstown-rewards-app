import type { Href, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

/**
 * Navigates to the route named in a notification's `data.deepLink` when the
 * user taps it (whether the app was foregrounded, backgrounded, or launched
 * fresh by the tap). Notification content is set by the sender (Phase 11's
 * admin dashboard) — deepLink is treated as an app-internal path only.
 */
export function useNotificationDeepLinks(router: ReturnType<typeof useRouter>) {
  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      const deepLink = response?.notification.request.content.data?.deepLink;
      if (typeof deepLink === 'string') {
        router.push(deepLink as Href);
      }
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const deepLink = response.notification.request.content.data?.deepLink;
      if (typeof deepLink === 'string') {
        router.push(deepLink as Href);
      }
    });

    return () => subscription.remove();
  }, [router]);
}

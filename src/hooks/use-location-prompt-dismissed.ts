import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY_PREFIX = 'qr:location-prompt-dismissed:';

/**
 * Persists "not now" on the Home screen's optional choose-a-location card,
 * per signed-in user, so it doesn't reappear on every login. Defaults to
 * `isDismissed: true` until the stored value loads, so the card never
 * flashes on screen before its real state is known.
 */
export function useLocationPromptDismissed(userId: string | undefined) {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY_PREFIX + userId).then((value) => {
      if (!cancelled) setIsDismissed(value === '1');
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const dismiss = useCallback(() => {
    if (!userId) return;
    setIsDismissed(true);
    AsyncStorage.setItem(STORAGE_KEY_PREFIX + userId, '1');
  }, [userId]);

  return { isDismissed, dismiss };
}

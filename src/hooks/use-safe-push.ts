import { useRouter, type Href } from 'expo-router';
import { useCallback, useRef } from 'react';

// Guards against the same route being pushed twice from a double-tap or a
// slow-rendering screen swallowing the first tap — expo-router's own
// navigation dedup only catches synchronous re-renders, not two distinct
// press events a few hundred ms apart.
const REPEAT_PUSH_WINDOW_MS = 600;

export function useSafePush() {
  const router = useRouter();
  const lastPushRef = useRef<{ href: string; at: number } | null>(null);

  const push = useCallback(
    (href: Href) => {
      const key = typeof href === 'string' ? href : JSON.stringify(href);
      const now = Date.now();
      const last = lastPushRef.current;
      if (last && last.href === key && now - last.at < REPEAT_PUSH_WINDOW_MS) {
        return;
      }
      lastPushRef.current = { href: key, at: now };
      router.push(href);
    },
    [router]
  );

  return { push, router };
}

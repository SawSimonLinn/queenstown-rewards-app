import { useCallback, useEffect, useState } from 'react';

import { getRestaurantLocationById } from '@/data/locations';
import type { RestaurantLocation } from '@/data/types';
import { useAuth } from '@/lib/auth';
import { getGuestRecentlyViewedSlugs, recordGuestLocationView } from '@/lib/recently-viewed-guest';
import { getRecentlyViewedLocationSlugs, recordLocationView } from '@/services/recently-viewed';

export type RecentlyViewedLocationsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; locations: RestaurantLocation[] };

/**
 * Location Details view history for Home's "Recently viewed" section.
 * Signed-in customers get Supabase-backed history (services/recently-viewed.ts);
 * guests get local-only history (lib/recently-viewed-guest.ts) — the two are
 * never merged, per the Home redesign brief.
 */
export function useRecentlyViewedLocations() {
  const { session } = useAuth();
  const [state, setState] = useState<RecentlyViewedLocationsState>({ status: 'loading' });

  const load = useCallback(async () => {
    try {
      const slugs = session
        ? await getRecentlyViewedLocationSlugs()
        : await getGuestRecentlyViewedSlugs();

      // A slug with no resolvable local record is a deleted/renamed
      // location — dropping it here satisfies "remove records that
      // reference deleted or inactive locations" without a cleanup job.
      const locations = slugs
        .map((slug) => getRestaurantLocationById(slug))
        .filter((location): location is RestaurantLocation => location !== undefined);

      setState({ status: 'success', locations });
    } catch (error) {
      console.error('Recently viewed locations failed to load:', error);
      setState({ status: 'error' });
    }
  }, [session]);

  useEffect(() => {
    // load() only calls setState from its async continuation (see
    // src/hooks/use-home-screen-data.ts for the sanctioned pattern) —
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: 'loading' });
    load();
  }, [load]);

  const recordView = useCallback(
    async (slug: string) => {
      try {
        if (session) {
          await recordLocationView(slug);
        } else {
          await recordGuestLocationView(slug);
        }
        await load();
      } catch (error) {
        console.error('Could not record location view:', error);
      }
    },
    [load, session]
  );

  return { state, recordView };
}

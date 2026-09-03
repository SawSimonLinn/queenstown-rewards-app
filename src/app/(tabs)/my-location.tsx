import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

import { LocationListItem } from '@/components/locations/location-list-item';
import { AppHeader } from '@/components/ui/app-header';
import { CardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { getRestaurantLocationById } from '@/data/locations';
import type { RestaurantLocation } from '@/data/types';
import { useProfileContext } from '@/lib/profile';
import { getSlugForSupabaseLocationId } from '@/services/locations';
import { getMyActiveStaffLocationIds } from '@/services/staff';

type MyLocationState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; locations: RestaurantLocation[] };

export default function MyLocationScreen() {
  const { profile } = useProfileContext();
  const router = useRouter();
  const [state, setState] = useState<MyLocationState>({ status: 'loading' });

  const load = useCallback(async () => {
    try {
      const supabaseLocationIds = await getMyActiveStaffLocationIds();
      const slugs = await Promise.all(supabaseLocationIds.map(getSlugForSupabaseLocationId));
      const locations = slugs
        .map((slug) => (slug ? getRestaurantLocationById(slug) : undefined))
        .filter((location): location is RestaurantLocation => location !== undefined);
      setState({ status: 'success', locations });
    } catch (error) {
      console.error('Assigned locations failed to load:', error);
      setState({
        status: 'error',
        message: "Couldn't load your assigned location. Check your connection and try again.",
      });
    }
  }, []);

  useEffect(() => {
    // load() only calls setState from its async continuation — see
    // src/hooks/use-home-screen-data.ts for the sanctioned pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: 'loading' });
    load();
  }, [load]);

  if (profile && profile.role === 'customer') {
    return (
      <ScreenContainer>
        <EmptyState
          icon="lock-closed-outline"
          title="Staff access only"
          message="This screen is for Queenstown Rewards staff accounts only."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll onRefresh={load} refreshing={state.status === 'loading'}>
      <AppHeader title="My Location" />

      {state.status === 'loading' && (
        <>
          <CardSkeleton />
        </>
      )}

      {state.status === 'error' && <ErrorState message={state.message} onRetry={load} />}

      {state.status === 'success' &&
        (state.locations.length === 0 ? (
          <EmptyState
            icon="storefront-outline"
            title="No location assigned"
            message="Ask an admin to assign you to a location."
          />
        ) : (
          state.locations.map((location) => (
            <LocationListItem
              key={location.id}
              location={location}
              isSelected={false}
              distanceLabel={null}
              onPress={() => router.push(`/locations/${location.id}`)}
            />
          ))
        ))}
    </ScreenContainer>
  );
}

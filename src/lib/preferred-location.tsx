// Preferred location, backed by Supabase (profiles.preferred_location_id) as
// the source of truth. Resolves the Supabase uuid to the rich local
// RestaurantLocation the rest of the app renders via the slug bridge in
// src/services/locations.ts.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

import { getRestaurantLocationById } from '@/data/locations';
import type { RestaurantLocation } from '@/data/types';
import { describeError } from '@/lib/errors';
import { useProfileContext } from '@/lib/profile';
import { getSlugForSupabaseLocationId, getSupabaseLocationId } from '@/services/locations';
import { updateMyProfile } from '@/services/profile';

type PreferredLocationContextValue = {
  /**
   * Null is a normal, valid state — no location has been chosen yet, and
   * nothing in this app ever picks one automatically. Selection only
   * happens via the star control (location cards, Location Details) or the
   * Preferred location screen in Account Settings.
   */
  preferredLocation: RestaurantLocation | null;
  isLoading: boolean;
  savePreferredLocation: (location: RestaurantLocation) => Promise<void>;
  /** Sets preferred_location_id back to null. Never affects membership or redemption history. */
  clearPreferredLocation: () => Promise<void>;
  /**
   * Set by the star control when a signed-out user taps it, so the location
   * they picked survives the login/register flow — RootLayoutNav returns
   * them to it (without auto-saving) once a session exists. See
   * src/app/_layout.tsx.
   */
  pendingLocationId: string | null;
  setPendingLocationId: (id: string | null) => void;
};

const PreferredLocationContext = createContext<PreferredLocationContextValue | null>(null);

export function PreferredLocationProvider({ children }: PropsWithChildren) {
  const { profile, isLoading: isProfileLoading, refetch: refetchProfile } = useProfileContext();
  const [preferredLocation, setPreferredLocation] = useState<RestaurantLocation | null>(null);
  const [isResolving, setIsResolving] = useState(true);
  const [pendingLocationId, setPendingLocationId] = useState<string | null>(null);

  const preferredLocationId = profile?.preferredLocationId ?? null;

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (!preferredLocationId) {
        if (!cancelled) {
          setPreferredLocation(null);
          setIsResolving(false);
        }
        return;
      }
      try {
        const slug = await getSlugForSupabaseLocationId(preferredLocationId);
        if (!cancelled) {
          setPreferredLocation(slug ? getRestaurantLocationById(slug) : null);
        }
      } catch {
        if (!cancelled) setPreferredLocation(null);
      } finally {
        if (!cancelled) setIsResolving(false);
      }
    }

    // resolve() only calls setState from its async continuation (see
    // src/hooks/use-home-screen-data.ts for why that's the sanctioned
    // pattern) — isResolving starts `true` and this settles it, it's never
    // set back to `true` here since resolution is a fast in-memory lookup.
    resolve();
    return () => {
      cancelled = true;
    };
  }, [preferredLocationId]);

  const savePreferredLocation = useCallback(
    async (location: RestaurantLocation) => {
      const supabaseLocationId = await getSupabaseLocationId(location.id);
      if (!supabaseLocationId) {
        throw new Error("This location isn't available to save right now.");
      }
      try {
        await updateMyProfile({ preferredLocationId: supabaseLocationId });
      } catch (error) {
        console.error('Failed to save preferred location:', describeError(error));
        throw error;
      }
      setPreferredLocation(location);
      refetchProfile();
    },
    [refetchProfile]
  );

  const clearPreferredLocation = useCallback(async () => {
    try {
      await updateMyProfile({ preferredLocationId: null });
    } catch (error) {
      console.error('Failed to clear preferred location:', describeError(error));
      throw error;
    }
    setPreferredLocation(null);
    refetchProfile();
  }, [refetchProfile]);

  const isLoading = isProfileLoading || isResolving;

  return (
    <PreferredLocationContext.Provider
      value={{
        preferredLocation,
        isLoading,
        savePreferredLocation,
        clearPreferredLocation,
        pendingLocationId,
        setPendingLocationId,
      }}
    >
      {children}
    </PreferredLocationContext.Provider>
  );
}

export function usePreferredLocation() {
  const context = useContext(PreferredLocationContext);
  if (!context) {
    throw new Error('usePreferredLocation must be used within a PreferredLocationProvider');
  }
  return context;
}

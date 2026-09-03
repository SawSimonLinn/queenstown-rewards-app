// In-memory "preferred location" selection. This resets when the app
// restarts — it is NOT real persistence. Once Phase 6 (auth) and Phase 7
// (database) land, this should be replaced by reading/writing
// `profiles.preferredLocationId` in Supabase instead.

import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import type { RestaurantLocation } from '@/data/types';

type PreferredLocationContextValue = {
  preferredLocation: RestaurantLocation | null;
  setPreferredLocation: (location: RestaurantLocation) => void;
};

const PreferredLocationContext = createContext<PreferredLocationContextValue | null>(null);

export function PreferredLocationProvider({ children }: PropsWithChildren) {
  const [preferredLocation, setPreferredLocation] = useState<RestaurantLocation | null>(null);

  const value = useMemo(() => ({ preferredLocation, setPreferredLocation }), [preferredLocation]);

  return (
    <PreferredLocationContext.Provider value={value}>{children}</PreferredLocationContext.Provider>
  );
}

export function usePreferredLocation() {
  const context = useContext(PreferredLocationContext);
  if (!context) {
    throw new Error('usePreferredLocation must be used within a PreferredLocationProvider');
  }
  return context;
}

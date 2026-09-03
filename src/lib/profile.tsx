import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import { useAuth } from '@/lib/auth';
import { getMyProfile } from '@/services/profile';
import type { Profile } from '@/types';

type ProfileContextValue = {
  profile: Profile | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
  refreshError: string | null;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchProfile = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      const isRefresh = mode === 'refresh';
      const message = "Couldn't load your profile. Check your connection and try again.";

      if (isRefresh) {
        setRefreshError(null);
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      if (!session) {
        setProfile(null);
        setIsLoading(false);
        setRefreshError(null);
        if (isRefresh) setIsRefreshing(false);
        isFetchingRef.current = false;
        return;
      }

      try {
        const result = await getMyProfile();
        setProfile(result);
        setRefreshError(null);
      } catch (error) {
        console.error('Profile failed to load:', error);
        if (isRefresh) {
          setRefreshError(message);
        } else {
          setProfile(null);
        }
      } finally {
        setIsLoading(false);
        if (isRefresh) setIsRefreshing(false);
        isFetchingRef.current = false;
      }
    },
    [session]
  );

  const refetch = useCallback(async () => {
    await fetchProfile(profile ? 'refresh' : 'initial');
  }, [fetchProfile, profile]);

  const refresh = useCallback(async () => {
    await fetchProfile('refresh');
  }, [fetchProfile]);

  useEffect(() => {
    // Re-fetches whenever the session changes (sign in/out). fetchProfile
    // only calls setState from its async continuation — see
    // src/hooks/use-home-screen-data.ts for why that's the sanctioned
    // pattern despite the rule's static-analysis limitation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, [fetchProfile]);

  return (
    <ProfileContext.Provider
      value={{ profile, isLoading, refetch, refresh, isRefreshing, refreshError }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
}

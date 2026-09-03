import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

import { useAuth } from '@/lib/auth';
import { getMyProfile } from '@/services/profile';
import type { Profile } from '@/types';

type ProfileContextValue = {
  profile: Profile | null;
  isLoading: boolean;
  refetch: () => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!session) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    try {
      const result = await getMyProfile();
      setProfile(result);
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    fetchProfile();
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
    <ProfileContext.Provider value={{ profile, isLoading, refetch }}>
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

// Burger Club membership, shared across the app so the root preloader can
// wait for it once alongside auth/profile/preferred-location instead of every
// screen (rewards, account settings) re-fetching it independently.

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
import { getMyClubMembership, joinBurgerClub } from '@/services/membership';
import type { ClubMembership } from '@/types';

export type MembershipState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; membership: ClubMembership | null };

type MembershipContextValue = {
  state: MembershipState;
  isLoading: boolean;
  retry: () => Promise<void>;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
  refreshError: string | null;
  join: () => Promise<ClubMembership>;
};

const MembershipContext = createContext<MembershipContextValue | null>(null);

export function MembershipProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const [state, setState] = useState<MembershipState>({ status: 'loading' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchData = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      const isRefresh = mode === 'refresh';
      const message = "Couldn't load your membership. Check your connection and try again.";

      if (isRefresh) {
        setRefreshError(null);
        setIsRefreshing(true);
      }

      if (!session) {
        setState({ status: 'success', membership: null });
        setRefreshError(null);
        if (isRefresh) setIsRefreshing(false);
        isFetchingRef.current = false;
        return;
      }

      try {
        const membership = await getMyClubMembership();
        setState({ status: 'success', membership });
        setRefreshError(null);
      } catch (error) {
        console.error('Membership failed to load:', error);
        if (isRefresh) {
          setRefreshError(message);
        } else {
          setState({ status: 'error', message });
        }
      } finally {
        if (isRefresh) setIsRefreshing(false);
        isFetchingRef.current = false;
      }
    },
    [session]
  );

  const retry = useCallback(async () => {
    setState({ status: 'loading' });
    await fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    if (state.status !== 'success') {
      await retry();
      return;
    }
    await fetchData('refresh');
  }, [fetchData, retry, state.status]);

  useEffect(() => {
    // Re-fetches whenever the session changes (sign in/out) — same
    // sanctioned async-continuation pattern as ProfileProvider.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: 'loading' });
    fetchData();
  }, [fetchData]);

  const join = useCallback(async () => {
    const membership = await joinBurgerClub();
    setState({ status: 'success', membership });
    setRefreshError(null);
    return membership;
  }, []);

  return (
    <MembershipContext.Provider
      value={{
        state,
        isLoading: state.status === 'loading',
        retry,
        refresh,
        isRefreshing,
        refreshError,
        join,
      }}
    >
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembershipContext() {
  const context = useContext(MembershipContext);
  if (!context) {
    throw new Error('useMembershipContext must be used within a MembershipProvider');
  }
  return context;
}

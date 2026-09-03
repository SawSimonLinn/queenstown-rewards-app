import { useCallback, useEffect, useRef, useState } from 'react';

import { getHomeScreenData, type HomeScreenData } from '@/services/home';

export type HomeScreenDataState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: HomeScreenData };

export function useHomeScreenData() {
  const [state, setState] = useState<HomeScreenDataState>({ status: 'loading' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    const isRefresh = mode === 'refresh';
    const message = "Couldn't load your rewards. Check your connection and try again.";

    if (isRefresh) {
      setRefreshError(null);
      setIsRefreshing(true);
    }

    try {
      const data = await getHomeScreenData();
      setState({ status: 'success', data });
      setRefreshError(null);
    } catch (error) {
      console.error('Home screen data failed to load:', error);
      if (isRefresh) {
        setRefreshError(message);
      } else {
        setState({ status: 'error', message });
      }
    } finally {
      if (isRefresh) setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

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
    // fetchData only calls setState after its internal `await`, i.e. from the
    // async continuation, which is the sanctioned pattern per the rule's own
    // docs ("calling setState in a callback function when external state
    // changes"). The rule's static analysis can't see past the await, hence:
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  return { state, retry, refresh, isRefreshing, refreshError };
}

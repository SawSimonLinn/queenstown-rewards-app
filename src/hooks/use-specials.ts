import { useCallback, useEffect, useRef, useState } from 'react';

import { getSpecials } from '@/services/specials';
import type { Special } from '@/types';

export type SpecialsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; specials: Special[] };

export function useSpecials() {
  const [state, setState] = useState<SpecialsState>({ status: 'loading' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    const isRefresh = mode === 'refresh';
    const message = "Couldn't load specials. Check your connection and try again.";

    if (isRefresh) {
      setRefreshError(null);
      setIsRefreshing(true);
    }

    try {
      const specials = await getSpecials();
      setState({ status: 'success', specials });
      setRefreshError(null);
    } catch {
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  return { state, retry, refresh, isRefreshing, refreshError };
}

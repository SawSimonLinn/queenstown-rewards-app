import { useCallback, useEffect, useRef, useState } from 'react';

import { getMyRedemptionHistory, type RedemptionHistoryItem } from '@/services/redemption';

export type RedemptionHistoryState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; items: RedemptionHistoryItem[] };

export function useRedemptionHistory() {
  const [state, setState] = useState<RedemptionHistoryState>({ status: 'loading' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    const isRefresh = mode === 'refresh';
    const message = "Couldn't load your redemption history. Check your connection and try again.";

    if (isRefresh) {
      setRefreshError(null);
      setIsRefreshing(true);
    }

    try {
      const items = await getMyRedemptionHistory();
      setState({ status: 'success', items });
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

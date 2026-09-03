import { useCallback, useEffect, useState } from 'react';

import { getMyRedemptionHistory, type RedemptionHistoryItem } from '@/services/redemption';

export type RedemptionHistoryState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; items: RedemptionHistoryItem[] };

export function useRedemptionHistory() {
  const [state, setState] = useState<RedemptionHistoryState>({ status: 'loading' });

  const fetchData = useCallback(async () => {
    try {
      const items = await getMyRedemptionHistory();
      setState({ status: 'success', items });
    } catch {
      setState({
        status: 'error',
        message: "Couldn't load your redemption history. Check your connection and try again.",
      });
    }
  }, []);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  return { state, retry };
}

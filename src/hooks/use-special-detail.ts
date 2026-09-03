import { useCallback, useEffect, useState } from 'react';

import { getSpecialDetail, type SpecialDetail } from '@/services/specials';

export type SpecialDetailState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'not-found' }
  | { status: 'success'; data: SpecialDetail };

export function useSpecialDetail(specialId: string) {
  const [state, setState] = useState<SpecialDetailState>({ status: 'loading' });

  const fetchData = useCallback(async () => {
    try {
      const data = await getSpecialDetail(specialId);
      setState(data ? { status: 'success', data } : { status: 'not-found' });
    } catch {
      setState({
        status: 'error',
        message: "Couldn't load this special. Check your connection and try again.",
      });
    }
  }, [specialId]);

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

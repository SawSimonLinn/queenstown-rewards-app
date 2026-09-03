import { useCallback, useEffect, useState } from 'react';

import { getSpecials } from '@/services/specials';
import type { Special } from '@/types';

export type SpecialsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; specials: Special[] };

export function useSpecials() {
  const [state, setState] = useState<SpecialsState>({ status: 'loading' });

  const fetchData = useCallback(async () => {
    try {
      const specials = await getSpecials();
      setState({ status: 'success', specials });
    } catch {
      setState({
        status: 'error',
        message: "Couldn't load specials. Check your connection and try again.",
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

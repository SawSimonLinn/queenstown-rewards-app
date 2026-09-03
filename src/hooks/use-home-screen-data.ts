import { useCallback, useEffect, useState } from 'react';

import { getHomeScreenData, type HomeScreenData } from '@/services/home';

export type HomeScreenDataState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: HomeScreenData };

export function useHomeScreenData() {
  const [state, setState] = useState<HomeScreenDataState>({ status: 'loading' });

  const fetchData = useCallback(async () => {
    try {
      const data = await getHomeScreenData();
      setState({ status: 'success', data });
    } catch (error) {
      console.error('Home screen data failed to load:', error);
      setState({
        status: 'error',
        message: "Couldn't load your rewards. Check your connection and try again.",
      });
    }
  }, []);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // fetchData only calls setState after its internal `await`, i.e. from the
    // async continuation, which is the sanctioned pattern per the rule's own
    // docs ("calling setState in a callback function when external state
    // changes"). The rule's static analysis can't see past the await, hence:
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  return { state, retry };
}

import { useCallback, useEffect, useState } from 'react';

import { getBurgerCampaignDetail, type BurgerCampaignDetail } from '@/services/burger';

export type BurgerCampaignDetailState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'not-found' }
  | { status: 'success'; data: BurgerCampaignDetail };

export function useBurgerCampaignDetail(campaignId: string) {
  const [state, setState] = useState<BurgerCampaignDetailState>({ status: 'loading' });

  const fetchData = useCallback(async () => {
    try {
      const data = await getBurgerCampaignDetail(campaignId);
      setState(data ? { status: 'success', data } : { status: 'not-found' });
    } catch {
      setState({
        status: 'error',
        message: "Couldn't load this campaign. Check your connection and try again.",
      });
    }
  }, [campaignId]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // See src/hooks/use-home-screen-data.ts for why this suppression is
    // correct: fetchData only calls setState from its async continuation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  return { state, retry };
}

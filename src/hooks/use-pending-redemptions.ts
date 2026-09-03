import { useCallback, useEffect, useState } from 'react';

import { confirmRedemption, getPendingRedemptions, type PendingRedemption } from '@/services/staff';

export type PendingRedemptionsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; redemptions: PendingRedemption[] };

export function usePendingRedemptions() {
  const [state, setState] = useState<PendingRedemptionsState>({ status: 'loading' });
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const redemptions = await getPendingRedemptions();
      setState({ status: 'success', redemptions });
    } catch {
      setState({
        status: 'error',
        message: "Couldn't load pending redemptions. Check your connection and try again.",
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

  const confirm = useCallback(
    async (redemptionId: string) => {
      setConfirmError(null);
      setConfirmingId(redemptionId);
      try {
        await confirmRedemption(redemptionId);
        await fetchData();
      } catch (error) {
        setConfirmError(
          error instanceof Error ? error.message : 'Could not confirm this redemption.'
        );
      } finally {
        setConfirmingId(null);
      }
    },
    [fetchData]
  );

  return { state, retry, confirm, confirmingId, confirmError };
}

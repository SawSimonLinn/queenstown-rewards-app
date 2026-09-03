import { useCallback, useEffect, useState } from 'react';

import {
  confirmRedemption,
  getPendingRedemptions,
  getRedemptionHistoryForStaff,
  type StaffRedemption,
} from '@/services/staff';

export type StaffRedemptionsSegment = 'pending' | 'history';

export type StaffRedemptionsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; redemptions: StaffRedemption[] };

/**
 * Backs the Requests screen's Pending/History segments, both narrowed by the
 * same location filter (null = the staff member's own assigned location(s),
 * or every location for an admin — see services/staff.ts).
 */
export function useStaffRedemptions(segment: StaffRedemptionsSegment, locationId: string | null) {
  const [state, setState] = useState<StaffRedemptionsState>({ status: 'loading' });
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const redemptions =
        segment === 'pending'
          ? await getPendingRedemptions(locationId)
          : await getRedemptionHistoryForStaff(locationId);
      setState({ status: 'success', redemptions });
    } catch {
      setState({
        status: 'error',
        message: `Couldn't load ${segment === 'pending' ? 'pending redemptions' : 'history'}. Check your connection and try again.`,
      });
    }
  }, [segment, locationId]);

  const retry = useCallback(async () => {
    setState({ status: 'loading' });
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    // fetchData only calls setState from its async continuation — see
    // src/hooks/use-home-screen-data.ts for the sanctioned pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: 'loading' });
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

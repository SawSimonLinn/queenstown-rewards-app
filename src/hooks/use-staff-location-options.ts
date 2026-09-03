import { useEffect, useState } from 'react';

import { getMyStaffLocationOptions, type StaffLocationOption } from '@/services/staff';

export type StaffLocationOptionsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; options: StaffLocationOption[] };

/** The location(s) to offer in the Requests screen's filter — see getMyStaffLocationOptions. */
export function useStaffLocationOptions() {
  const [state, setState] = useState<StaffLocationOptionsState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const options = await getMyStaffLocationOptions();
        if (!cancelled) setState({ status: 'success', options });
      } catch (error) {
        console.error('Staff location options failed to load:', error);
        if (!cancelled) setState({ status: 'error' });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

import { useCallback, useEffect, useState } from 'react';

import {
  requestRedemption,
  RedemptionError,
  type RedemptionErrorCode,
  type RedemptionRequestSuccess,
} from '@/services/redemption';

export type QrValidationState =
  | { status: 'loading' }
  | { status: 'network-error'; message: string }
  | { status: 'rejected'; code: RedemptionErrorCode; message: string }
  | { status: 'pending'; result: RedemptionRequestSuccess };

export function useQrValidation(token: string, locationId: string) {
  const [state, setState] = useState<QrValidationState>({ status: 'loading' });

  const fetchResult = useCallback(async () => {
    try {
      const result = await requestRedemption(token, locationId);
      setState({ status: 'pending', result });
    } catch (error) {
      if (error instanceof RedemptionError) {
        setState({ status: 'rejected', code: error.code, message: error.message });
      } else {
        setState({
          status: 'network-error',
          message: "Couldn't check this QR code. Check your connection and try again.",
        });
      }
    }
  }, [token, locationId]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    fetchResult();
  }, [fetchResult]);

  useEffect(() => {
    // See src/hooks/use-home-screen-data.ts for why this suppression is
    // correct: fetchResult only calls setState from its async continuation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchResult();
  }, [fetchResult]);

  return { state, retry };
}

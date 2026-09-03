import { isRedeemable } from '@/lib/eligibility';
import type { EntitlementStatus } from '@/types';

describe('isRedeemable', () => {
  it('is redeemable only when eligible', () => {
    expect(isRedeemable('eligible')).toBe(true);
  });

  it.each<EntitlementStatus>(['redeemed', 'expired', 'ineligible'])(
    'is not redeemable when status is %s',
    (status) => {
      expect(isRedeemable(status)).toBe(false);
    }
  );
});

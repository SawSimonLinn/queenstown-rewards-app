import { RedemptionError, toRedemptionError } from '@/lib/redemption-errors';

describe('toRedemptionError', () => {
  it.each([
    ['INVALID_QR', 'invalid_qr'],
    ['EXPIRED_QR', 'expired_qr'],
    ['WRONG_LOCATION', 'wrong_location'],
    ['ALREADY_REDEEMED', 'already_redeemed'],
    ['INELIGIBLE', 'ineligible'],
    ['NOT_AUTHENTICATED', 'not_authenticated'],
  ])('maps a Postgres exception containing %s to code %s', (raised, expectedCode) => {
    const error = toRedemptionError({ message: raised });
    expect(error).toBeInstanceOf(RedemptionError);
    expect(error.code).toBe(expectedCode);
  });

  it('maps an unrecognized error message to "unknown"', () => {
    const error = toRedemptionError({ message: 'connection reset' });
    expect(error.code).toBe('unknown');
  });

  it('preserves the original message text', () => {
    const error = toRedemptionError({ message: 'EXPIRED_QR' });
    expect(error.message).toBe('EXPIRED_QR');
  });
});

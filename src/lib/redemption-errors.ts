// Pure error-mapping logic, kept separate from services/redemption.ts (which
// needs the Supabase client) so it can be unit tested without any I/O setup.

export type RedemptionErrorCode =
  | 'invalid_qr'
  | 'expired_qr'
  | 'wrong_location'
  | 'already_redeemed'
  | 'ineligible'
  | 'not_authenticated'
  | 'unknown';

const ERROR_CODE_MAP: Record<string, RedemptionErrorCode> = {
  INVALID_QR: 'invalid_qr',
  EXPIRED_QR: 'expired_qr',
  WRONG_LOCATION: 'wrong_location',
  ALREADY_REDEEMED: 'already_redeemed',
  INELIGIBLE: 'ineligible',
  NOT_AUTHENTICATED: 'not_authenticated',
};

export class RedemptionError extends Error {
  code: RedemptionErrorCode;
  constructor(code: RedemptionErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export function toRedemptionError(error: { message: string }): RedemptionError {
  const matchedKey = Object.keys(ERROR_CODE_MAP).find((key) => error.message.includes(key));
  const code = matchedKey ? ERROR_CODE_MAP[matchedKey] : 'unknown';
  return new RedemptionError(code, error.message);
}

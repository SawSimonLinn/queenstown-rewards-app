import type { EntitlementStatus } from '@/types';

/**
 * The single source of truth for "can this customer redeem right now",
 * derived from their entitlement status. The backend (Phase 9's
 * request_redemption function) is the actual enforcement point — this only
 * drives what the UI shows/enables, so it must never diverge from the
 * server's own checks in request_redemption.sql.
 */
export function isRedeemable(status: EntitlementStatus): boolean {
  return status === 'eligible';
}

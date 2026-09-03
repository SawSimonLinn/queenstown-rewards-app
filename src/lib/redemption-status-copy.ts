import type { StatusTone } from '@/components/ui/status-badge';
import type { RedemptionStatus } from '@/types';

/** Shared label/tone for a redemption's status — used by the customer's Redemption history (Rewards tab) and the staff Requests/History screens. */
export const REDEMPTION_STATUS_COPY: Record<RedemptionStatus, { label: string; tone: StatusTone }> = {
  confirmed: { label: 'Redeemed', tone: 'success' },
  pending_staff_confirmation: { label: 'Awaiting confirmation', tone: 'warning' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
  corrected: { label: 'Corrected', tone: 'neutral' },
};

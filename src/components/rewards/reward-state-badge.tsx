import { StatusBadge, type StatusTone } from '@/components/ui/status-badge';
import type { EntitlementStatus } from '@/types';

export type RewardStateBadgeProps = {
  status: EntitlementStatus;
};

const BADGE_COPY: Record<EntitlementStatus, { label: string; tone: StatusTone }> = {
  eligible: { label: 'Available', tone: 'success' },
  redeemed: { label: 'Used', tone: 'primary' },
  expired: { label: 'Expired', tone: 'danger' },
  ineligible: { label: 'Ineligible', tone: 'warning' },
};

export function RewardStateBadge({ status }: RewardStateBadgeProps) {
  const { label, tone } = BADGE_COPY[status];
  return <StatusBadge label={label} tone={tone} />;
}

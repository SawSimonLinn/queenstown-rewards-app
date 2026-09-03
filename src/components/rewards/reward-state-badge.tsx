import { StatusBadge, type StatusTone } from '@/components/ui/status-badge';
import type { EntitlementStatus } from '@/types';

export type RewardStateBadgeProps = {
  status: EntitlementStatus;
};

const BADGE_COPY: Record<EntitlementStatus, { label: string; tone: StatusTone; solid?: boolean }> = {
  eligible: { label: 'Your burger is ready', tone: 'success' },
  redeemed: { label: 'Redeemed this month', tone: 'neutral', solid: true },
  expired: { label: 'Expired', tone: 'danger' },
  ineligible: { label: 'Ineligible', tone: 'warning' },
};

export function RewardStateBadge({ status }: RewardStateBadgeProps) {
  const { label, tone, solid } = BADGE_COPY[status];
  return <StatusBadge label={label} tone={tone} solid={solid} />;
}

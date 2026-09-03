import type { StatusTone } from '@/components/ui/status-badge';
import type { Special } from '@/types';

export type SpecialTimingState = 'active' | 'upcoming' | 'expired';

export function getSpecialTimingState(
  special: Pick<Special, 'startDate' | 'endDate'>,
  at: Date = new Date()
): SpecialTimingState {
  const now = at.getTime();
  const start = new Date(special.startDate).getTime();
  const end = new Date(special.endDate).getTime();
  if (now < start) return 'upcoming';
  if (now > end) return 'expired';
  return 'active';
}

const TIMING_COPY: Record<SpecialTimingState, { label: string; tone: StatusTone }> = {
  active: { label: 'Active', tone: 'success' },
  upcoming: { label: 'Upcoming', tone: 'primary' },
  expired: { label: 'Ended', tone: 'neutral' },
};

export function getSpecialTiming(
  special: Pick<Special, 'startDate' | 'endDate'>,
  at: Date = new Date()
) {
  return TIMING_COPY[getSpecialTimingState(special, at)];
}

import { StatusBadge, type StatusTone } from '@/components/ui/status-badge';
import { STATUS_COPY, type LocationStatus } from '@/lib/schedule';

const TONE: Record<LocationStatus, StatusTone> = {
  open: 'success',
  'closing-soon': 'warning',
  closed: 'neutral',
  unconfirmed: 'primary',
};

const ICON: Record<LocationStatus, 'time' | 'time-outline' | 'help-circle'> = {
  open: 'time',
  'closing-soon': 'time',
  closed: 'time-outline',
  unconfirmed: 'help-circle',
};

export function OpenStatusBadge({ status }: { status: LocationStatus }) {
  return <StatusBadge label={STATUS_COPY[status]} tone={TONE[status]} icon={ICON[status]} />;
}

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { StatusBadge, getToneColor, type StatusTone } from '@/components/ui/status-badge';
import { useBrand } from '@/hooks/use-brand';
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

/** Minimal colour-dot + label variant for tight spaces (e.g. small carousel cards) where the full pill badge is too heavy. */
export function OpenStatusDot({ status }: { status: LocationStatus }) {
  const brand = useBrand();
  const color = getToneColor(brand)[TONE[status]];
  return (
    <View style={styles.row} accessibilityLabel={STATUS_COPY[status]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <ThemedText type="small" numberOfLines={1} style={{ color }}>
        {STATUS_COPY[status]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

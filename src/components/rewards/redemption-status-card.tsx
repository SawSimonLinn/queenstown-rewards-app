import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { StatusBadge, type StatusTone } from '@/components/ui/status-badge';
import { Brand, IconSize, Spacing } from '@/constants/theme';
import { formatDate } from '@/lib/format';
import type { MonthlyEntitlement } from '@/types';

export type RedemptionStatusCardProps = {
  entitlement: MonthlyEntitlement;
};

const STATUS_COPY: Record<
  MonthlyEntitlement['status'],
  { label: string; tone: StatusTone; icon: keyof typeof Ionicons.glyphMap }
> = {
  eligible: { label: 'Available now', tone: 'success', icon: 'checkmark-circle' },
  redeemed: { label: 'Redeemed this month', tone: 'primary', icon: 'ribbon' },
  expired: { label: 'Redemption unavailable', tone: 'neutral', icon: 'time-outline' },
  ineligible: { label: 'Redemption unavailable', tone: 'neutral', icon: 'time-outline' },
};

/** First of next calendar month, from an entitlement's "YYYY-MM" periodMonth (or the current date if absent). */
function getNextRewardDate(periodMonth: string | undefined): Date {
  const base = periodMonth ? new Date(`${periodMonth}-01T00:00:00`) : new Date();
  return new Date(base.getFullYear(), base.getMonth() + 1, 1);
}

/**
 * Compact monthly-redemption status, distinct from the BurgerClubHero card
 * above it on Home — no image, no CTA, just the current entitlement state
 * backed by real Supabase data (never computed from local state alone).
 */
export function RedemptionStatusCard({ entitlement }: RedemptionStatusCardProps) {
  const copy = STATUS_COPY[entitlement.status];

  return (
    <Card accessibilityLabel={`Monthly redemption: ${copy.label}`}>
      <View style={styles.row}>
        <Ionicons name={copy.icon} size={IconSize.medium} color={Brand.primary} />
        <StatusBadge label={copy.label} tone={copy.tone} />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {entitlement.status === 'redeemed' && entitlement.redeemedAt
          ? `Redeemed ${formatDate(entitlement.redeemedAt)}`
          : entitlement.status === 'eligible'
            ? 'Scan at a participating location to redeem.'
            : `Next reward available ${formatDate(getNextRewardDate(entitlement.periodMonth).toISOString())}`}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});

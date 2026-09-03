import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ClubRewardCard } from '@/components/rewards/club-reward-card';
import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SectionHeader } from '@/components/ui/section-header';
import { CardSkeleton, HeroCardSkeleton } from '@/components/ui/skeleton';
import { StatusBadge, type StatusTone } from '@/components/ui/status-badge';
import { Brand, IconSize, Spacing } from '@/constants/theme';
import { QUEENSTOWN_LOCATIONS } from '@/data/locations';
import { useHomeScreenData } from '@/hooks/use-home-screen-data';
import { useRedemptionHistory } from '@/hooks/use-redemption-history';
import { formatDate } from '@/lib/format';
import { usePreferredLocation } from '@/lib/preferred-location';
import { useProfileContext } from '@/lib/profile';
import type { RedemptionHistoryItem } from '@/services/redemption';
import type { RedemptionStatus } from '@/types';

const PARTICIPATING_LOCATION_COUNT = QUEENSTOWN_LOCATIONS.filter(
  (location) => location.currentlyParticipating
).length;

const HISTORY_STATUS_COPY: Record<RedemptionStatus, { label: string; tone: StatusTone }> = {
  confirmed: { label: 'Redeemed', tone: 'success' },
  pending_staff_confirmation: { label: 'Awaiting confirmation', tone: 'warning' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
  corrected: { label: 'Corrected', tone: 'neutral' },
};

export default function RewardsScreen() {
  const { state, retry } = useHomeScreenData();
  const { state: historyState, retry: retryHistory } = useRedemptionHistory();
  const { preferredLocation } = usePreferredLocation();
  const { profile } = useProfileContext();
  const router = useRouter();

  return (
    <ScreenContainer scroll>
      <AppHeader title="Rewards" />

      {state.status === 'loading' && <HeroCardSkeleton />}
      {state.status === 'error' && <ErrorState message={state.message} onRetry={retry} />}

      {state.status === 'success' &&
        (state.data.campaign && state.data.entitlement ? (
          <ClubRewardCard
            campaign={state.data.campaign}
            status={state.data.entitlement.status}
            periodMonth={state.data.entitlement.periodMonth}
            memberName={profile?.fullName}
            preferredLocationName={preferredLocation?.name}
            participatingLocationCount={PARTICIPATING_LOCATION_COUNT}
            onRedeemPress={() => router.push('/redemption/confirm')}
            onViewTermsPress={() => router.push('/burger-club/terms')}
          />
        ) : (
          <Card accessibilityLabel="No reward this month">
            <EmptyState
              icon="gift-outline"
              title="No active reward"
              message="There's no Burger of the Month campaign right now — check back soon."
            />
          </Card>
        ))}

      <View style={styles.guideRow}>
        <Ionicons name="information-circle-outline" size={IconSize.medium} color={Brand.primary} />
        <ThemedText type="small" themeColor="textSecondary" style={styles.guideBody}>
          Buy another qualifying entrée, scan at the restaurant and ask your server to confirm.{' '}
          <ThemedText
            type="linkPrimary"
            onPress={() => router.push('/burger-club/how-it-works')}
          >
            Full details
          </ThemedText>
        </ThemedText>
      </View>

      <SectionHeader title="Redemption history" />

      {historyState.status === 'loading' && (
        <View style={styles.historyLoading}>
          <CardSkeleton />
          <CardSkeleton />
        </View>
      )}

      {historyState.status === 'error' && (
        <ErrorState message={historyState.message} onRetry={retryHistory} />
      )}

      {historyState.status === 'success' &&
        (historyState.items.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No redemptions yet"
            message="Your redeemed and expired rewards will show up here."
          />
        ) : (
          <View style={styles.historyList}>
            {historyState.items.map((item, index) => (
              <HistoryRow
                key={item.id}
                item={item}
                isLast={index === historyState.items.length - 1}
              />
            ))}
          </View>
        ))}
    </ScreenContainer>
  );
}

function HistoryRow({ item, isLast }: { item: RedemptionHistoryItem; isLast: boolean }) {
  const copy = HISTORY_STATUS_COPY[item.status];
  return (
    <View
      style={[styles.historyRow, !isLast && styles.historyRowBorder]}
      accessibilityLabel={`${item.campaignName} at ${item.locationName}, ${copy.label}`}
    >
      <View style={styles.timelineRail}>
        <View style={styles.timelineDot} />
        {!isLast && <View style={styles.timelineLine} />}
      </View>
      <View style={styles.historyContent}>
        <View style={styles.historyHeader}>
          <ThemedText type="smallBold" style={styles.historyTitle}>
            {item.campaignName}
          </ThemedText>
          <StatusBadge label={copy.label} tone={copy.tone} />
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {item.locationName}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatDate(item.redeemedAt)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  guideRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  guideBody: {
    flex: 1,
  },
  historyLoading: {
    gap: Spacing.three,
  },
  historyList: {
    borderTopWidth: 1,
    borderTopColor: `${Brand.charcoal}14`,
  },
  historyRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  historyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: `${Brand.charcoal}14`,
  },
  timelineRail: {
    width: 18,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Brand.primary,
    marginTop: 7,
  },
  timelineLine: {
    width: 1,
    flex: 1,
    backgroundColor: `${Brand.charcoal}18`,
    marginTop: 4,
  },
  historyContent: {
    flex: 1,
    gap: 4,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  historyTitle: {
    flex: 1,
  },
});

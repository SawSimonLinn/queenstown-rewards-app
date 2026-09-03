import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { JoinClubCard } from '@/components/membership/join-club-card';
import { JoinClubSheet } from '@/components/membership/join-club-sheet';
import { MembershipStatusCard } from '@/components/membership/membership-status-card';
import { ClubRewardCard } from '@/components/rewards/club-reward-card';
import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { InlineFeedback } from '@/components/ui/inline-feedback';
import { FadeInView } from '@/components/ui/motion';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SectionHeader } from '@/components/ui/section-header';
import { CardSkeleton, HeroCardSkeleton, MembershipSkeleton } from '@/components/ui/skeleton';
import { StatusBadge, type StatusTone } from '@/components/ui/status-badge';
import { Brand, IconSize, Spacing } from '@/constants/theme';
import { QUEENSTOWN_LOCATIONS } from '@/data/locations';
import { useHomeScreenData } from '@/hooks/use-home-screen-data';
import { useMembership } from '@/hooks/use-membership';
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
  const {
    state,
    retry,
    refresh: refreshHome,
    isRefreshing: isHomeRefreshing,
    refreshError: homeRefreshError,
  } = useHomeScreenData();
  const {
    state: historyState,
    retry: retryHistory,
    refresh: refreshHistory,
    isRefreshing: isHistoryRefreshing,
    refreshError: historyRefreshError,
  } = useRedemptionHistory();
  const {
    state: membershipState,
    retry: retryMembership,
    refresh: refreshMembership,
    isRefreshing: isMembershipRefreshing,
    refreshError: membershipRefreshError,
    join,
  } = useMembership();
  const { preferredLocation } = usePreferredLocation();
  const { profile } = useProfileContext();
  const router = useRouter();
  const [joinSheetVisible, setJoinSheetVisible] = useState(false);

  const isMember = membershipState.status === 'success' && !!membershipState.membership;
  const isRefreshing = isHomeRefreshing || isHistoryRefreshing || isMembershipRefreshing;
  const refreshError = membershipRefreshError ?? homeRefreshError ?? historyRefreshError;
  const handleRefresh = useCallback(async () => {
    await Promise.all([refreshMembership(), refreshHome(), refreshHistory()]);
  }, [refreshHistory, refreshHome, refreshMembership]);

  return (
    <ScreenContainer scroll onRefresh={handleRefresh} refreshing={isRefreshing}>
      <AppHeader
        title="Rewards"
        rightIcon="qr-code-outline"
        rightAccessibilityLabel="Scan QR code"
        onRightPress={() => router.push('/redemption/scan')}
      />
      {refreshError && <InlineFeedback message={refreshError} />}

      {membershipState.status === 'loading' && (
        <FadeInView>
          <MembershipSkeleton />
        </FadeInView>
      )}
      {membershipState.status === 'error' && (
        <FadeInView>
          <ErrorState message={membershipState.message} onRetry={retryMembership} />
        </FadeInView>
      )}

      {membershipState.status === 'success' &&
        (membershipState.membership ? (
          <FadeInView>
            <MembershipStatusCard membership={membershipState.membership} />
          </FadeInView>
        ) : (
          <FadeInView style={styles.contentGroup}>
            <JoinClubCard
              campaign={state.status === 'success' ? state.data.campaign : null}
              onJoinPress={() => setJoinSheetVisible(true)}
              onViewTermsPress={() => router.push('/burger-club/terms')}
            />
            <JoinClubSheet
              visible={joinSheetVisible}
              onDismiss={() => setJoinSheetVisible(false)}
              onConfirm={async () => {
                await join();
                setJoinSheetVisible(false);
              }}
              onViewTermsPress={() => router.push('/burger-club/terms')}
            />
          </FadeInView>
        ))}

      {isMember && (
        <>
          {state.status === 'loading' && (
            <FadeInView>
              <HeroCardSkeleton />
            </FadeInView>
          )}
          {state.status === 'error' && (
            <FadeInView>
              <ErrorState message={state.message} onRetry={retry} />
            </FadeInView>
          )}

          {state.status === 'success' &&
            (state.data.campaign && state.data.entitlement ? (
              <FadeInView slide layout>
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
              </FadeInView>
            ) : (
              <FadeInView>
                <Card accessibilityLabel="No reward this month">
                  <EmptyState
                    icon="gift-outline"
                    title="No active reward"
                    message="There's no Burger of the Month campaign right now — check back soon."
                  />
                </Card>
              </FadeInView>
            ))}

          <View style={styles.guideRow}>
            <Ionicons
              name="information-circle-outline"
              size={IconSize.medium}
              color={Brand.primary}
            />
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
            <FadeInView style={styles.historyLoading}>
              <CardSkeleton />
              <CardSkeleton />
            </FadeInView>
          )}

          {historyState.status === 'error' && (
            <FadeInView>
              <ErrorState message={historyState.message} onRetry={retryHistory} />
            </FadeInView>
          )}

          {historyState.status === 'success' &&
            (historyState.items.length === 0 ? (
              <FadeInView>
                <EmptyState
                  icon="receipt-outline"
                  title="No redemptions yet"
                  message="Your redeemed and expired rewards will show up here."
                />
              </FadeInView>
            ) : (
              <View style={styles.historyList}>
                {historyState.items.map((item, index) => (
                  <FadeInView key={item.id} layout>
                    <HistoryRow item={item} isLast={index === historyState.items.length - 1} />
                  </FadeInView>
                ))}
              </View>
            ))}
        </>
      )}
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
  contentGroup: {
    gap: Spacing.three,
  },
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

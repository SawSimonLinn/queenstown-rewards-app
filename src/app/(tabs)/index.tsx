import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BurgerClubHero, type HeroCtaState } from '@/components/burger/burger-club-hero';
import { ChooseLocationPromptCard } from '@/components/locations/choose-location-prompt-card';
import { LocationCard } from '@/components/locations/location-card';
import { SelectedLocationCard } from '@/components/locations/selected-location-card';
import { JoinClubSheet } from '@/components/membership/join-club-sheet';
import { RedemptionStatusCard } from '@/components/rewards/redemption-status-card';
import { SpecialCard } from '@/components/rewards/special-card';
import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { InlineFeedback } from '@/components/ui/inline-feedback';
import { FadeInView } from '@/components/ui/motion';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SectionHeader } from '@/components/ui/section-header';
import {
  HeroCardSkeleton,
  Skeleton,
  SkeletonCard,
  SpecialCardSkeleton,
} from '@/components/ui/skeleton';
import { APP_NAME } from '@/constants/app';
import { Brand, Spacing } from '@/constants/theme';
import type { RestaurantLocation } from '@/data/types';
import { useHomeScreenData } from '@/hooks/use-home-screen-data';
import { useLocationPromptDismissed } from '@/hooks/use-location-prompt-dismissed';
import { useMembership } from '@/hooks/use-membership';
import { useNearbyLocations } from '@/hooks/use-nearby-locations';
import { useSafePush } from '@/hooks/use-safe-push';
import { useAuth } from '@/lib/auth';
import { useNotificationInbox } from '@/lib/notification-inbox';
import { usePreferredLocation } from '@/lib/preferred-location';
import { useProfileContext } from '@/lib/profile';
import { getSpecialTimingState } from '@/lib/special-timing';
import type { HomeScreenData } from '@/services/home';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const { state, retry, refresh, isRefreshing, refreshError } = useHomeScreenData();
  const { preferredLocation } = usePreferredLocation();
  const { profile } = useProfileContext();
  const { session } = useAuth();
  const { unreadCount } = useNotificationInbox();
  const {
    state: membershipState,
    refresh: refreshMembership,
    join: joinClub,
  } = useMembership();
  const { locations: nearbyLocations, distanceLabelFor, permissionState, promptAndRequestLocation } =
    useNearbyLocations(preferredLocation);
  const { push, router } = useSafePush();
  const { isDismissed: isLocationPromptDismissed, dismiss: dismissLocationPrompt } =
    useLocationPromptDismissed(session?.user.id);
  const [joinSheetVisible, setJoinSheetVisible] = useState(false);

  const firstName = profile?.fullName?.split(' ')[0];
  const isMember = membershipState.status === 'success' && !!membershipState.membership;

  useFocusEffect(
    useCallback(() => {
      refresh();
      refreshMembership();
      // Intentionally fires once per focus, not on every refresh identity
      // change — see AGENTS.md pattern used by useHomeScreenData/useMembership.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const goToLocation = useCallback(
    (locationId: string) => {
      push(`/location/${locationId}`);
    },
    [push]
  );

  const heroCtaState: HeroCtaState = !session
    ? 'guest'
    : !isMember
      ? 'join'
      : state.status === 'success' && !state.data.campaign
        ? 'no-campaign'
        : state.status === 'success' && state.data.entitlement?.status === 'eligible'
          ? 'eligible'
          : 'redeemed';

  const onCtaPress = () => {
    if (heroCtaState === 'guest') {
      router.push('/(auth)/login');
    } else if (heroCtaState === 'join') {
      setJoinSheetVisible(true);
    } else if (heroCtaState === 'eligible') {
      router.push('/redemption/scan');
    }
  };

  return (
    <ScreenContainer scroll onRefresh={refresh} refreshing={isRefreshing}>
      <AppHeader
        eyebrow={firstName ? `${greeting()}, ${firstName}` : 'Welcome to Queenstown'}
        title={APP_NAME}
        rightIcon="notifications-outline"
        rightAccessibilityLabel="Open notifications"
        rightBadgeCount={unreadCount}
        onRightPress={() => router.push('/notifications')}
      />

      {refreshError && <InlineFeedback message={refreshError} />}

      {state.status === 'loading' && (
        <FadeInView style={styles.loadingGroup}>
          <HeroCardSkeleton />
          <SkeletonCard>
            <Skeleton width={104} height={12} />
            <Skeleton width="72%" height={16} />
            <Skeleton width="48%" height={14} />
          </SkeletonCard>
          <View style={styles.skeletonSection}>
            <Skeleton width={126} height={14} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalRow}
            >
              <SpecialCardSkeleton feature />
              <SpecialCardSkeleton />
            </ScrollView>
          </View>
        </FadeInView>
      )}

      {state.status === 'error' && (
        <FadeInView>
          <ErrorState message={state.message} onRetry={retry} />
        </FadeInView>
      )}

      {state.status === 'success' && (
        <FadeInView slide layout style={styles.contentGroup}>
          <BurgerClubHero
            campaign={state.data.campaign}
            entitlement={state.data.entitlement}
            preferredLocation={preferredLocation}
            ctaState={heroCtaState}
            onCtaPress={onCtaPress}
          />

          {isMember && state.data.campaign && state.data.entitlement && (
            <RedemptionStatusCard entitlement={state.data.entitlement} />
          )}

          {preferredLocation ? (
            <SelectedLocationCard
              location={preferredLocation}
              onPress={() => goToLocation(preferredLocation.id)}
            />
          ) : (
            !isLocationPromptDismissed && (
              <ChooseLocationPromptCard
                onChooseLocation={() => router.push('/(tabs)/locations')}
                onDismiss={dismissLocationPrompt}
              />
            )
          )}

          <SpecialsSection
            specials={state.data.specials.filter(
              (special) => getSpecialTimingState(special) === 'active'
            )}
            onSpecialPress={(specialId) => push(`/specials/${specialId}`)}
            onSeeAllPress={() => router.push('/specials')}
          />

          <NearYouSection
            locations={nearbyLocations}
            distanceLabelFor={distanceLabelFor}
            showEnableLocation={permissionState !== 'granted'}
            onEnableLocation={promptAndRequestLocation}
            onLocationPress={goToLocation}
            onSeeAllPress={() => router.push('/(tabs)/locations')}
          />

          <ThemedText
            type="linkPrimary"
            style={styles.howItWorksLink}
            onPress={() => router.push('/burger-club/how-it-works')}
          >
            How Burger of the Month works
          </ThemedText>
        </FadeInView>
      )}

      <JoinClubSheet
        visible={joinSheetVisible}
        onDismiss={() => setJoinSheetVisible(false)}
        onConfirm={async () => {
          await joinClub();
          // Home's entitlement was fetched before membership existed (the
          // RPC requires an active membership — see
          // 20260903092000_require_membership_for_entitlement.sql), so it's
          // still null until we refetch now that joining succeeded.
          await refresh();
          setJoinSheetVisible(false);
        }}
        onViewTermsPress={() => router.push('/burger-club/terms')}
      />
    </ScreenContainer>
  );
}

function SpecialsSection({
  specials,
  onSpecialPress,
  onSeeAllPress,
}: {
  specials: HomeScreenData['specials'];
  onSpecialPress: (specialId: string) => void;
  onSeeAllPress: () => void;
}) {
  return (
    <>
      <SectionHeader
        title="Current specials"
        actionLabel={specials.length > 0 ? 'See all' : undefined}
        onActionPress={onSeeAllPress}
      />
      {specials.length === 0 ? (
        <Card accessibilityLabel="No specials right now">
          <EmptyState
            icon="pricetag-outline"
            title="No specials right now"
            message="New specials drop regularly — check back soon."
          />
        </Card>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalRow}
        >
          {specials.map((special, index) => (
            <FadeInView key={special.id} layout>
              <SpecialCard
                special={special}
                variant={index === 0 ? 'feature' : 'compact'}
                onPress={() => onSpecialPress(special.id)}
              />
            </FadeInView>
          ))}
        </ScrollView>
      )}
    </>
  );
}

function NearYouSection({
  locations,
  distanceLabelFor,
  showEnableLocation,
  onEnableLocation,
  onLocationPress,
  onSeeAllPress,
}: {
  locations: RestaurantLocation[];
  distanceLabelFor: (location: RestaurantLocation) => string | null;
  showEnableLocation: boolean;
  onEnableLocation: () => void;
  onLocationPress: (locationId: string) => void;
  onSeeAllPress: () => void;
}) {
  return (
    <>
      <SectionHeader title="Near you" actionLabel="See all" onActionPress={onSeeAllPress} />
      {showEnableLocation && (
        <ThemedText type="linkPrimary" onPress={onEnableLocation} style={styles.enableLocationLink}>
          Enable location for distances
        </ThemedText>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalRow}
      >
        {locations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            distanceLabel={distanceLabelFor(location)}
            onPress={() => onLocationPress(location.id)}
          />
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  loadingGroup: {
    gap: Spacing.four,
  },
  contentGroup: {
    gap: Spacing.four,
  },
  skeletonSection: {
    gap: Spacing.three,
  },
  horizontalRow: {
    gap: Spacing.three,
    paddingRight: Spacing.four,
  },
  enableLocationLink: {
    marginTop: -Spacing.two,
  },
  howItWorksLink: {
    alignSelf: 'center',
    color: Brand.primaryDark,
  },
});

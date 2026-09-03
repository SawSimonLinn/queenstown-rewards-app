import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BurgerClubHero } from '@/components/burger/burger-club-hero';
import { SelectedLocationCard } from '@/components/locations/selected-location-card';
import { SpecialCard } from '@/components/rewards/special-card';
import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SectionHeader } from '@/components/ui/section-header';
import { HeroCardSkeleton, SkeletonBlock } from '@/components/ui/skeleton';
import { APP_NAME } from '@/constants/app';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { getDefaultRestaurantLocation, QUEENSTOWN_LOCATIONS } from '@/data/locations';
import { useHomeScreenData } from '@/hooks/use-home-screen-data';
import { usePreferredLocation } from '@/lib/preferred-location';
import { useProfileContext } from '@/lib/profile';
import type { HomeScreenData } from '@/services/home';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const { state, retry } = useHomeScreenData();
  const { preferredLocation } = usePreferredLocation();
  const { profile } = useProfileContext();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const firstName = profile?.fullName?.split(' ')[0];
  const activeLocation = preferredLocation ?? getDefaultRestaurantLocation();

  const handleRefresh = () => {
    setIsRefreshing(true);
    retry();
    // retry() re-renders through the loading state; give the pull-to-refresh
    // spinner a brief, honest window rather than yanking it away instantly.
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <ScreenContainer scroll onRefresh={handleRefresh} refreshing={isRefreshing}>
      <AppHeader
        eyebrow={firstName ? `${greeting()}, ${firstName}` : greeting()}
        title={APP_NAME}
        rightIcon="notifications-outline"
        rightAccessibilityLabel="Notifications"
        onRightPress={() => {}}
      />

      {state.status === 'loading' && (
        <View style={styles.loadingGroup}>
          <HeroCardSkeleton />
          <SkeletonBlock height={72} radius={16} />
        </View>
      )}

      {state.status === 'error' && <ErrorState message={state.message} onRetry={retry} />}

      {state.status === 'success' && (
        <HomeScreenContent
          campaign={state.data.campaign}
          entitlement={state.data.entitlement}
          specials={state.data.specials}
          activeLocation={activeLocation}
          onCampaignPress={(campaignId) => router.push(`/burger/${campaignId}`)}
          onHowItWorksPress={() => router.push('/burger-club/how-it-works')}
          onSpecialPress={(specialId) => router.push(`/specials/${specialId}`)}
          onSeeAllSpecialsPress={() => router.push('/specials')}
          onLocationPress={(locationId) => router.push(`/locations/${locationId}`)}
          onSeeAllLocationsPress={() => router.push('/locations')}
        />
      )}
    </ScreenContainer>
  );
}

type HomeScreenContentProps = HomeScreenData & {
  activeLocation: ReturnType<typeof getDefaultRestaurantLocation>;
  onCampaignPress: (campaignId: string) => void;
  onHowItWorksPress: () => void;
  onSpecialPress: (specialId: string) => void;
  onSeeAllSpecialsPress: () => void;
  onLocationPress: (locationId: string) => void;
  onSeeAllLocationsPress: () => void;
};

function HomeScreenContent({
  campaign,
  entitlement,
  specials,
  activeLocation,
  onCampaignPress,
  onHowItWorksPress,
  onSpecialPress,
  onSeeAllSpecialsPress,
  onLocationPress,
  onSeeAllLocationsPress,
}: HomeScreenContentProps) {
  return (
    <>
      <BurgerClubHero
        campaign={campaign}
        entitlement={entitlement}
        preferredLocation={activeLocation}
        onViewBurger={() => campaign && onCampaignPress(campaign.id)}
        onHowItWorks={onHowItWorksPress}
      />

      <SelectedLocationCard
        location={activeLocation}
        onPress={() => onLocationPress(activeLocation.id)}
      />

      <SectionHeader
        eyebrow="This month"
        title="Featured specials"
        actionLabel={specials.length > 0 ? 'See all' : undefined}
        onActionPress={onSeeAllSpecialsPress}
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
          contentContainerStyle={styles.specialsRow}
        >
          {specials.map((special, index) => (
            <SpecialCard
              key={special.id}
              special={special}
              variant={index === 0 ? 'feature' : 'compact'}
              onPress={() => onSpecialPress(special.id)}
            />
          ))}
        </ScrollView>
      )}

      <SectionHeader
        eyebrow="Queenstown Hospitality Group"
        title="Seven San Diego kitchens"
        actionLabel="View all"
        onActionPress={onSeeAllLocationsPress}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.locationsRow}
      >
        {QUEENSTOWN_LOCATIONS.map((location) => (
          <Pressable
            key={location.id}
            onPress={() => onLocationPress(location.id)}
            accessibilityRole="button"
            accessibilityLabel={location.name}
            style={({ pressed }) => [styles.locationChip, pressed && styles.locationChipPressed]}
          >
            <View style={styles.locationMark}>
              <ThemedText type="smallBold" style={styles.locationMarkText}>
                {location.shortName.slice(0, 2).toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText type="small" numberOfLines={1} style={styles.locationChipLabel}>
              {location.shortName}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  loadingGroup: {
    gap: Spacing.four,
  },
  specialsRow: {
    gap: Spacing.three,
    paddingRight: Spacing.four,
  },
  locationsRow: {
    gap: Spacing.four,
    paddingRight: Spacing.four,
    paddingTop: Spacing.one,
  },
  locationChip: {
    alignItems: 'center',
    gap: 6,
    width: 60,
  },
  locationChipPressed: {
    opacity: 0.7,
  },
  locationMark: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    backgroundColor: Brand.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Brand.primary}26`,
  },
  locationMarkText: {
    color: Brand.primaryDark,
  },
  locationChipLabel: {
    textAlign: 'center',
  },
});

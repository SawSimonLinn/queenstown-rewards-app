import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { FadingImage } from '@/components/ui/fading-image';
import { FadeInView } from '@/components/ui/motion';
import { HeroCardSkeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { Brand, IconSize, Radius, Shadows, Spacing } from '@/constants/theme';
import { pickStockImage, STOCK_SPECIAL_IMAGES } from '@/data/stock-images';
import { useTabBarBottomPadding } from '@/hooks/use-tab-bar-bottom-padding';
import { useSpecialDetail } from '@/hooks/use-special-detail';
import { formatDateRange } from '@/lib/format';
import { getSpecialTiming } from '@/lib/special-timing';

function useGoBack() {
  const router = useRouter();
  const hasNavigatedRef = useRef(false);

  return () => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };
}

export default function SpecialDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, retry } = useSpecialDetail(id);
  const goBack = useGoBack();
  const bottomPadding = useTabBarBottomPadding();

  if (state.status === 'success') {
    const timing = getSpecialTiming(state.data.special);
    return (
      <ThemedView style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottomPadding }}
        >
          <FadeInView slide layout>
            <View style={styles.hero}>
              <FadingImage
                source={
                  state.data.special.imageUrl ??
                  pickStockImage(STOCK_SPECIAL_IMAGES, state.data.special.id)
                }
                height="100%"
                radius={0}
                style={StyleSheet.absoluteFill}
                fallbackIcon="pricetag"
                fallbackLabel="Sample special photo"
              />

              <LinearGradient
                colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)']}
                style={styles.heroTopScrim}
                pointerEvents="none"
              />
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.82)']}
                style={styles.heroBottomScrim}
                pointerEvents="none"
              />

              <SafeAreaView edges={['top']} style={styles.heroTopBar}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                  onPress={goBack}
                  hitSlop={2}
                  style={({ pressed }) => [styles.heroButton, pressed && styles.heroButtonPressed]}
                >
                  <Ionicons name="chevron-back" size={20} color={Brand.charcoal} />
                </Pressable>
              </SafeAreaView>

              <View style={styles.heroContent}>
                <View style={styles.headerRow}>
                  <ThemedText type="title" style={styles.title}>
                    {state.data.special.title}
                  </ThemedText>
                  <StatusBadge label={timing.label} tone={timing.tone} solid />
                </View>
              </View>
            </View>

            <View style={styles.contentGroup}>
              <ThemedText themeColor="textSecondary">
                {state.data.special.description}
              </ThemedText>

              <Card accessibilityLabel="Special dates">
                <View style={styles.rowHeader}>
                  <Ionicons name="calendar-outline" size={IconSize.medium} color={Brand.primary} />
                  <ThemedText type="smallBold">Available</ThemedText>
                </View>
                <ThemedText themeColor="textSecondary">
                  {formatDateRange(state.data.special.startDate, state.data.special.endDate)}
                </ThemedText>
              </Card>

              <Card accessibilityLabel="Special locations">
                <View style={styles.rowHeader}>
                  <Ionicons name="location-outline" size={IconSize.medium} color={Brand.primary} />
                  <ThemedText type="smallBold">Available at</ThemedText>
                </View>
                {state.data.locations.length === 0 ? (
                  <ThemedText themeColor="textSecondary">All locations</ThemedText>
                ) : (
                  state.data.locations.map((location) => (
                    <ThemedText key={location.id} themeColor="textSecondary">
                      {location.name}
                    </ThemedText>
                  ))
                )}
              </Card>

              <Card accessibilityLabel="Terms">
                <View style={styles.rowHeader}>
                  <Ionicons
                    name="document-text-outline"
                    size={IconSize.medium}
                    color={Brand.primary}
                  />
                  <ThemedText type="smallBold">Terms</ThemedText>
                </View>
                <ThemedText themeColor="textSecondary">
                  Cannot be combined with other offers. While stocks last at participating
                  locations. Sample terms — not official Queenstown pricing.
                </ThemedText>
              </Card>
            </View>
          </FadeInView>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={goBack}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={IconSize.large} color={Brand.charcoal} />
          </Pressable>
        </View>

        {state.status === 'loading' && (
          <FadeInView style={styles.padded}>
            <HeroCardSkeleton />
          </FadeInView>
        )}

        {state.status === 'error' && (
          <FadeInView style={styles.padded}>
            <ErrorState message={state.message} onRetry={retry} />
          </FadeInView>
        )}

        {state.status === 'not-found' && (
          <FadeInView style={styles.padded}>
            <Card accessibilityLabel="Special not found">
              <ThemedText themeColor="textSecondary">
                This special couldn&apos;t be found. It may have ended.
              </ThemedText>
            </Card>
          </FadeInView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  padded: {
    paddingHorizontal: Spacing.four,
  },
  hero: {
    height: 360,
    backgroundColor: Brand.mutedSurface,
    overflow: 'hidden',
  },
  heroTopScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  heroBottomScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  heroTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  heroButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: `${Brand.onPrimary}E6`,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  heroButtonPressed: {
    opacity: 0.75,
  },
  heroContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.four,
  },
  contentGroup: {
    gap: Spacing.four,
    padding: Spacing.four,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    color: Brand.onPrimary,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

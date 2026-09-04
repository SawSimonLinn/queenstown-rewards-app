import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { FadingImage } from '@/components/ui/fading-image';
import { FadeInView } from '@/components/ui/motion';
import { ScreenContainer } from '@/components/ui/screen-container';
import { HeroCardSkeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { Brand, IconSize, Spacing } from '@/constants/theme';
import { pickStockImage, STOCK_SPECIAL_IMAGES } from '@/data/stock-images';
import { useSpecialDetail } from '@/hooks/use-special-detail';
import { formatDateRange } from '@/lib/format';
import { getSpecialTiming } from '@/lib/special-timing';

export default function SpecialDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, retry } = useSpecialDetail(id);

  return (
    <ScreenContainer scroll>
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

      {state.status === 'not-found' && (
        <FadeInView>
          <Card accessibilityLabel="Special not found">
            <ThemedText themeColor="textSecondary">
              This special couldn&apos;t be found. It may have ended.
            </ThemedText>
          </Card>
        </FadeInView>
      )}

      {state.status === 'success' &&
        (() => {
          const timing = getSpecialTiming(state.data.special);
          return (
            <FadeInView slide layout style={styles.contentGroup}>
              <FadingImage
                source={
                  state.data.special.imageUrl ??
                  pickStockImage(STOCK_SPECIAL_IMAGES, state.data.special.id)
                }
                height={190}
                fallbackIcon="pricetag"
                fallbackLabel="Sample special photo"
              />

              <View style={styles.headerRow}>
                <ThemedText type="title" style={styles.title}>
                  {state.data.special.title}
                </ThemedText>
                <StatusBadge label={timing.label} tone={timing.tone} />
              </View>
              <ThemedText themeColor="textSecondary">{state.data.special.description}</ThemedText>

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
            </FadeInView>
          );
        })()}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contentGroup: {
    gap: Spacing.four,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

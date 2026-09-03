import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { FadingImage } from '@/components/ui/fading-image';
import { InlineFeedback } from '@/components/ui/inline-feedback';
import { FadeInView } from '@/components/ui/motion';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SpecialCardSkeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { Spacing } from '@/constants/theme';
import { useSpecials } from '@/hooks/use-specials';
import { formatDateRange } from '@/lib/format';
import { getSpecialTiming } from '@/lib/special-timing';

export default function SpecialsFeedScreen() {
  const { state, retry, refresh, isRefreshing, refreshError } = useSpecials();
  const router = useRouter();

  return (
    <ScreenContainer scroll onRefresh={refresh} refreshing={isRefreshing}>
      {refreshError && <InlineFeedback message={refreshError} />}

      {state.status === 'loading' && (
        <FadeInView style={styles.loadingGroup}>
          <SpecialCardSkeleton />
          <SpecialCardSkeleton />
          <SpecialCardSkeleton />
        </FadeInView>
      )}

      {state.status === 'error' && (
        <FadeInView>
          <ErrorState message={state.message} onRetry={retry} />
        </FadeInView>
      )}

      {state.status === 'success' &&
        (state.specials.length === 0 ? (
          <FadeInView>
            <EmptyState
              icon="pricetag-outline"
              title="No specials right now"
              message="No specials are running right now — check back soon."
            />
          </FadeInView>
        ) : (
          <View style={styles.list}>
            {state.specials.map((special) => {
              const timing = getSpecialTiming(special);
              return (
                <FadeInView key={special.id} layout>
                  <Card
                    accessibilityLabel={`Special: ${special.title}`}
                    onPress={() => router.push(`/specials/${special.id}`)}
                    noPadding
                    style={styles.card}
                  >
                    <FadingImage
                      source={special.imageUrl}
                      height={110}
                      radius={0}
                      fallbackIcon="pricetag"
                      fallbackSize="small"
                    />
                    <View style={styles.cardBody}>
                      <View style={styles.cardHeader}>
                        <ThemedText type="smallBold" style={styles.title}>
                          {special.title}
                        </ThemedText>
                        <StatusBadge label={timing.label} tone={timing.tone} />
                      </View>
                      <ThemedText type="small" themeColor="textSecondary">
                        {formatDateRange(special.startDate, special.endDate)}
                      </ThemedText>
                      <ThemedText themeColor="textSecondary" numberOfLines={2}>
                        {special.description}
                      </ThemedText>
                    </View>
                  </Card>
                </FadeInView>
              );
            })}
          </View>
        ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingGroup: {
    gap: Spacing.three,
  },
  list: {
    gap: Spacing.three,
  },
  card: {
    overflow: 'hidden',
  },
  cardBody: {
    padding: Spacing.four,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
  },
});

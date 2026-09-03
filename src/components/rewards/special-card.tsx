import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { FoodImagePlaceholder } from '@/components/ui/food-image-placeholder';
import { Brand, Spacing } from '@/constants/theme';
import { formatDateRange } from '@/lib/format';
import type { Special } from '@/types';

export type SpecialCardProps = {
  special: Special;
  onPress?: () => void;
  variant?: 'feature' | 'compact';
};

export function SpecialCard({ special, onPress, variant = 'compact' }: SpecialCardProps) {
  const isFeature = variant === 'feature';

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`Special: ${special.title}`}
      noPadding
      style={[styles.card, isFeature && styles.featureCard]}
    >
      <FoodImagePlaceholder
        height={isFeature ? 132 : 96}
        radius={0}
        icon="pricetag"
        size="small"
        label={isFeature ? 'Featured special' : undefined}
      />
      <View style={[styles.body, isFeature && styles.featureBody]}>
        <ThemedText type={isFeature ? 'subtitle' : 'smallBold'} numberOfLines={isFeature ? 2 : 1}>
          {special.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
          {special.description}
        </ThemedText>
        <ThemedText type="eyebrow" style={styles.dates}>
          {formatDateRange(special.startDate, special.endDate)}
        </ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 214,
    overflow: 'hidden',
  },
  featureCard: {
    width: 272,
  },
  body: {
    padding: Spacing.three,
    gap: 6,
  },
  featureBody: {
    paddingBottom: Spacing.four,
  },
  dates: {
    marginTop: 4,
    color: Brand.primaryDark,
  },
});

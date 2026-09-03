import { StyleSheet, View } from 'react-native';

import { OpenStatusBadge } from '@/components/locations/open-status-badge';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { FadingImage } from '@/components/ui/fading-image';
import { Spacing } from '@/constants/theme';
import { getLocationImages } from '@/data/location-images';
import type { RestaurantLocation } from '@/data/types';
import { getFullAddress } from '@/lib/maps';
import { getLocationStatus } from '@/lib/schedule';

export type LocationCardProps = {
  location: RestaurantLocation;
  distanceLabel?: string | null;
  onPress: () => void;
};

/** Compact carousel card shared by Home's "Near you" and "Recently viewed" sections. */
export function LocationCard({ location, distanceLabel, onPress }: LocationCardProps) {
  const status = getLocationStatus(location);
  const thumbnail = getLocationImages(location.id).logo ?? getLocationImages(location.id).hero;

  return (
    <Card
      noPadding
      onPress={onPress}
      accessibilityLabel={`${location.name}, ${location.neighbourhood}`}
      style={styles.card}
    >
      <FadingImage
        source={thumbnail}
        height={112}
        radius={0}
        fallbackIcon="storefront"
        fallbackSize="small"
      />

      <View style={styles.body}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {location.name}
        </ThemedText>

        <View style={styles.metaRow}>
          <OpenStatusBadge status={status} />
          {distanceLabel && (
            <ThemedText type="small" themeColor="textSecondary">
              {distanceLabel}
            </ThemedText>
          )}
        </View>

        <ThemedText type="small" themeColor="textMuted" numberOfLines={1} style={styles.address}>
          {getFullAddress(location)}
        </ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    overflow: 'hidden',
  },
  body: {
    padding: Spacing.three,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.one,
  },
  address: {
    marginTop: -2,
  },
});

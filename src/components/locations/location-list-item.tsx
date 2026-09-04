import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { OpenStatusDot } from '@/components/locations/open-status-badge';
import { ThemedText } from '@/components/themed-text';
import { FadingImage } from '@/components/ui/fading-image';
import { Brand, IconSize, Radius, Spacing } from '@/constants/theme';
import { getLocationImages } from '@/data/location-images';
import type { RestaurantLocation } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { usePreferredLocation } from '@/lib/preferred-location';
import { getLocationStatus, getTodayHoursLabel } from '@/lib/schedule';

export type LocationListItemProps = {
  location: RestaurantLocation;
  isSelected: boolean;
  distanceLabel: string | null;
  onPress: () => void;
};

export function LocationListItem({
  location,
  isSelected,
  distanceLabel,
  onPress,
}: LocationListItemProps) {
  const theme = useTheme();
  const status = getLocationStatus(location);
  const todayHours = getTodayHoursLabel(location);
  const thumbnail = getLocationImages(location.id).logo ?? getLocationImages(location.id).hero;
  const { preferredLocation } = usePreferredLocation();
  const isPreferred = preferredLocation?.id === location.id;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        isPreferred
          ? `${location.name}, ${location.neighbourhood}, your preferred location`
          : `${location.name}, ${location.neighbourhood}`
      }
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        isPreferred && styles.rowPreferred,
        isSelected && styles.rowSelected,
        pressed && styles.pressed,
      ]}
    >
      {thumbnail ? (
        <FadingImage
          source={thumbnail}
          width={72}
          height={72}
          radius={Radius.medium}
          fallbackIcon="storefront"
          fallbackSize="small"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View style={styles.thumbnailFallback}>
          <ThemedText type="smallBold" style={styles.thumbnailInitial}>
            {location.shortName.charAt(0)}
          </ThemedText>
        </View>
      )}

      <View style={styles.textGroup}>
        <View style={styles.nameRow}>
          <ThemedText type="smallBold" numberOfLines={1} style={styles.name}>
            {location.name}
          </ThemedText>
          {isPreferred && (
            <Ionicons
              name="star"
              size={13}
              color={Brand.primary}
              accessibilityLabel="Your preferred location"
            />
          )}
        </View>

        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {distanceLabel ? `${location.neighbourhood} · ${distanceLabel}` : location.neighbourhood}
        </ThemedText>

        <View style={styles.statusRow}>
          <OpenStatusDot status={status} />
          <ThemedText type="small" themeColor="textMuted" numberOfLines={1} style={styles.hours}>
            {`· ${todayHours}`}
          </ThemedText>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={IconSize.medium} color={theme.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: `${Brand.charcoal}12`,
  },
  rowPreferred: {
    borderLeftWidth: 3,
    borderLeftColor: Brand.primary,
    paddingLeft: Spacing.three - 3,
  },
  rowSelected: {
    backgroundColor: `${Brand.primary}0D`,
  },
  pressed: {
    opacity: 0.7,
  },
  thumbnailFallback: {
    width: 72,
    height: 72,
    borderRadius: Radius.medium,
    backgroundColor: Brand.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailInitial: {
    color: Brand.primaryDark,
    fontSize: 18,
  },
  textGroup: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    flexShrink: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hours: {
    flex: 1,
    marginLeft: 4,
  },
});

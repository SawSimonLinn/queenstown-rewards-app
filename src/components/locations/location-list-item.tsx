import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { OpenStatusBadge } from '@/components/locations/open-status-badge';
import { ThemedText } from '@/components/themed-text';
import { Brand, IconSize, Radius, Spacing } from '@/constants/theme';
import { getLocationImages } from '@/data/location-images';
import type { RestaurantLocation } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { getFullAddress } from '@/lib/maps';
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

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${location.name}, ${location.neighbourhood}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        isSelected && styles.rowSelected,
        pressed && styles.pressed,
      ]}
    >
      {thumbnail ? (
        <Image source={thumbnail} style={styles.thumbnail} accessibilityIgnoresInvertColors />
      ) : (
        <View style={styles.thumbnailFallback}>
          <ThemedText type="smallBold" style={styles.thumbnailInitial}>
            {location.shortName.charAt(0)}
          </ThemedText>
        </View>
      )}

      <View style={styles.textGroup}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {location.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {location.neighbourhood}
        </ThemedText>

        <View style={styles.metaRow}>
          <OpenStatusBadge status={status} />
          {location.currentlyParticipating && (
            <View style={styles.clubTag} accessibilityLabel="Burger Club participant">
              <Ionicons name="gift" size={11} color={Brand.secondaryDark} />
            </View>
          )}
        </View>

        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {todayHours}
        </ThemedText>

        <View style={styles.addressRow}>
          <ThemedText type="small" themeColor="textMuted" numberOfLines={1} style={styles.address}>
            {getFullAddress(location)}
          </ThemedText>
          {distanceLabel && (
            <ThemedText type="small" themeColor="textMuted" style={styles.distance}>
              {distanceLabel}
            </ThemedText>
          )}
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
  rowSelected: {
    backgroundColor: `${Brand.primary}0D`,
  },
  pressed: {
    opacity: 0.7,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: Radius.medium,
    backgroundColor: Brand.mutedSurface,
  },
  thumbnailFallback: {
    width: 52,
    height: 52,
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
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginVertical: 2,
  },
  clubTag: {
    width: 20,
    height: 20,
    borderRadius: Radius.pill,
    backgroundColor: `${Brand.secondary}26`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  address: {
    flex: 1,
  },
  distance: {
    fontWeight: '700',
  },
});

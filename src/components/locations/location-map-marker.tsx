import { memo } from 'react';
import { Marker } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Radius } from '@/constants/theme';
import type { RestaurantLocation } from '@/data/types';

export type LocationMapMarkerProps = {
  location: RestaurantLocation;
  isSelected: boolean;
  onPress: () => void;
};

/**
 * Custom Queenstown orange-red map pin, with a distinct larger style + name
 * label when selected.
 *
 * `location.coordinates` is passed straight through as the `coordinate`
 * prop (never spread into a new `{ latitude, longitude }` literal) because
 * it's a stable reference from the static location dataset — a fresh object
 * every render would make react-native-maps think the pin moved and
 * re-place it natively on every parent re-render (e.g. every search
 * keystroke), which reads as the map "drifting". Memoised on
 * `location.id`/`isSelected` alone so an `onPress` identity change (which
 * happens on most parent re-renders) doesn't force a re-render either.
 */
export const LocationMapMarker = memo(function LocationMapMarker({
  location,
  isSelected,
  onPress,
}: LocationMapMarkerProps) {
  if (!location.coordinates) return null;

  return (
    <Marker
      coordinate={location.coordinates}
      onPress={onPress}
      title={location.name}
      description={location.neighbourhood}
      accessibilityLabel={`${location.name}, ${location.neighbourhood}${
        isSelected ? ', selected' : ''
      }`}
      tracksViewChanges={false}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.wrap}>
        {isSelected && (
          <View style={styles.label}>
            <ThemedText type="small" style={styles.labelText} numberOfLines={1}>
              {location.shortName}
            </ThemedText>
          </View>
        )}
        <View style={[styles.pin, isSelected && styles.pinSelected]}>
          <View style={styles.pinDot} />
        </View>
        <View style={[styles.tail, isSelected && styles.tailSelected]} />
      </View>
    </Marker>
  );
},
areEqual);

function areEqual(prev: LocationMapMarkerProps, next: LocationMapMarkerProps): boolean {
  return prev.location.id === next.location.id && prev.isSelected === next.isSelected;
}

const PIN_SIZE = 28;
const PIN_SIZE_SELECTED = 36;

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  label: {
    backgroundColor: Brand.charcoal,
    borderRadius: Radius.small,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
    maxWidth: 140,
  },
  labelText: {
    color: Brand.onPrimary,
    fontWeight: '700',
  },
  pin: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    backgroundColor: Brand.primary,
    borderWidth: 2,
    borderColor: Brand.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinSelected: {
    width: PIN_SIZE_SELECTED,
    height: PIN_SIZE_SELECTED,
    borderRadius: PIN_SIZE_SELECTED / 2,
    backgroundColor: Brand.primaryDark,
    borderWidth: 3,
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Brand.onPrimary,
  },
  tail: {
    width: 8,
    height: 8,
    marginTop: -5,
    backgroundColor: Brand.primary,
    transform: [{ rotate: '45deg' }],
  },
  tailSelected: {
    backgroundColor: Brand.primaryDark,
  },
});

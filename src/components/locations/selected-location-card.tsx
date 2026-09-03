import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { OpenStatusBadge } from '@/components/locations/open-status-badge';
import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { RestaurantLocation } from '@/data/types';
import { getLocationStatus } from '@/lib/schedule';

export type SelectedLocationCardProps = {
  location: RestaurantLocation;
  onPress?: () => void;
};

/** A compact, undecorated row — not a card — for the one preferred-location moment on Home. */
export function SelectedLocationCard({ location, onPress }: SelectedLocationCardProps) {
  const status = getLocationStatus(location);
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Your selected location: ${location.name}`}
      style={({ pressed }) => [
        styles.row,
        { borderColor: theme.border },
        pressed && onPress && styles.pressed,
      ]}
    >
      <View style={styles.textGroup}>
        <ThemedText type="eyebrow">Your restaurant</ThemedText>
        <ThemedText type="smallBold">{location.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {location.neighbourhood}
        </ThemedText>
      </View>
      <OpenStatusBadge status={status} />
      {onPress && <Ionicons name="chevron-forward" size={18} color={Brand.primary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brand, IconSize, Radius, Spacing } from '@/constants/theme';
import { QUEENSTOWN_LOCATIONS } from '@/data/locations';
import type { RestaurantLocation } from '@/data/types';
import { useBrand } from '@/hooks/use-brand';
import { useTheme } from '@/hooks/use-theme';
import { getFullAddress } from '@/lib/maps';

export type LocationSelectorProps = {
  title: string;
  message: string;
  initialSelectedId?: string | null;
  saveLabel?: string;
  onSave: (location: RestaurantLocation) => Promise<void>;
};

/** Shared "pick one of the seven locations and save" UI — used both for the
 * first-time onboarding prompt and for changing the preferred location later.
 */
export function LocationSelector({
  title,
  message,
  initialSelectedId = null,
  saveLabel = 'Save location',
  onSave,
}: LocationSelectorProps) {
  const theme = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedLocation =
    QUEENSTOWN_LOCATIONS.find((location) => location.id === selectedId) ?? null;

  const handleSave = async () => {
    if (!selectedLocation || isSaving) return;
    setError(null);
    setIsSaving(true);
    try {
      await onSave(selectedLocation);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Couldn't save your location. Try again."
      );
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">{title}</ThemedText>
        <ThemedText themeColor="textSecondary">{message}</ThemedText>
      </View>

      {error && (
        <Card accessibilityLabel="Save location error">
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </Card>
      )}

      <FlatList
        data={QUEENSTOWN_LOCATIONS}
        keyExtractor={(location) => location.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <LocationOptionRow
            location={item}
            isSelected={item.id === selectedId}
            onPress={() => setSelectedId(item.id)}
          />
        )}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
        )}
      />

      <Button
        label={saveLabel}
        onPress={handleSave}
        loading={isSaving}
        loadingLabel="Saving"
        disabled={!selectedLocation}
        size="large"
      />
    </View>
  );
}

function LocationOptionRow({
  location,
  isSelected,
  onPress,
}: {
  location: RestaurantLocation;
  isSelected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const brand = useBrand();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${location.name}, ${location.neighbourhood}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: isSelected ? brand.primary : theme.border },
        isSelected && [styles.rowSelected, { backgroundColor: `${brand.primary}0D` }],
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.textGroup}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {location.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {location.neighbourhood} · {getFullAddress(location)}
        </ThemedText>
      </View>
      <Ionicons
        name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
        size={IconSize.medium}
        color={isSelected ? brand.primary : theme.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.one,
  },
  errorText: {
    color: Brand.danger,
  },
  list: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  separator: {
    height: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  rowSelected: {
    backgroundColor: `${Brand.primary}0D`,
  },
  pressed: {
    opacity: 0.8,
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
});

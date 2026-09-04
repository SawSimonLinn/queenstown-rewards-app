import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { LocationListItem } from '@/components/locations/location-list-item';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Brand, MaxContentWidth, MinTouchTarget, Radius, Spacing } from '@/constants/theme';
import { QUEENSTOWN_LOCATIONS } from '@/data/locations';
import type { RestaurantLocation } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { getDirectionsUrl, getFullAddress } from '@/lib/maps';
import { getLocationStatus, hasBrunchService, hasHappyHourService } from '@/lib/schedule';

type FilterKey = 'all' | 'open' | 'brunch' | 'happy-hour';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open now' },
  { key: 'brunch', label: 'Brunch' },
  { key: 'happy-hour', label: 'Happy hour' },
];

export default function LocationsWebScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const filteredLocations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return QUEENSTOWN_LOCATIONS.filter((location) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        location.name.toLowerCase().includes(normalizedQuery) ||
        location.shortName.toLowerCase().includes(normalizedQuery) ||
        location.neighbourhood.toLowerCase().includes(normalizedQuery) ||
        getFullAddress(location).toLowerCase().includes(normalizedQuery);

      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'open'
            ? ['open', 'closing-soon'].includes(getLocationStatus(location))
            : filter === 'brunch'
              ? hasBrunchService(location)
              : hasHappyHourService(location);

      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <ThemedText type="eyebrow" themeColor="textSecondary">
            Locations
          </ThemedText>
          <ThemedText type="title">Find a Queenstown spot</ThemedText>
        </View>

        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Open all Queenstown locations in Google Maps"
          onPress={() =>
            Linking.openURL(
              'https://www.google.com/maps/search/?api=1&query=Queenstown%20Hospitality%20Group%20San%20Diego'
            )
          }
          style={({ pressed }) => [styles.mapLink, pressed && styles.pressed]}
        >
          <Ionicons name="map" size={18} color={Brand.primary} />
          <ThemedText type="smallBold" style={styles.mapLinkText}>
            Google Maps
          </ThemedText>
        </Pressable>
      </View>

      <View
        style={[
          styles.searchBar,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}
      >
        <Ionicons name="search" size={18} color={theme.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search locations"
          placeholderTextColor={theme.textSecondary}
          style={[styles.searchInput, { color: theme.text }]}
          accessibilityLabel="Search locations"
          autoCapitalize="none"
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => setQuery('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {FILTERS.map(({ key, label }) => {
          const isActive = filter === key;

          return (
            <Pressable
              key={key}
              onPress={() => setFilter(key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={({ pressed }) => [
                styles.filterButton,
                {
                  backgroundColor: isActive ? Brand.charcoal : theme.backgroundElement,
                  borderColor: isActive ? Brand.charcoal : theme.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <ThemedText
                type="smallBold"
                style={isActive ? styles.filterTextActive : undefined}
                themeColor={isActive ? undefined : 'textSecondary'}
              >
                {label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.summaryRow}>
        <ThemedText type="smallBold">
          {filteredLocations.length} {filteredLocations.length === 1 ? 'location' : 'locations'}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          San Diego County
        </ThemedText>
      </View>

      {filteredLocations.length > 0 ? (
        <View
          style={[
            styles.list,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}
        >
          {filteredLocations.map((location) => (
            <WebLocationRow
              key={location.id}
              location={location}
              onPress={() =>
                router.push({ pathname: '/location/[id]', params: { id: location.id } })
              }
            />
          ))}
        </View>
      ) : (
        <EmptyState
          title="No locations found"
          message="Try a different search or filter."
          icon="search"
        />
      )}
    </ScreenContainer>
  );
}

function WebLocationRow({
  location,
  onPress,
}: {
  location: RestaurantLocation;
  onPress: () => void;
}) {
  return (
    <View style={styles.rowWrap}>
      <LocationListItem
        location={location}
        isSelected={false}
        distanceLabel={null}
        onPress={onPress}
      />
      <View style={styles.rowActions}>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Open directions to ${location.name}`}
          onPress={() => Linking.openURL(getDirectionsUrl(location))}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <Ionicons name="navigate" size={16} color={Brand.primary} />
          <ThemedText type="smallBold" style={styles.actionText}>
            Directions
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingTop: Spacing.three,
  },
  titleGroup: {
    flex: 1,
    gap: Spacing.one,
  },
  mapLink: {
    minHeight: MinTouchTarget,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: `${Brand.primary}33`,
    backgroundColor: Brand.primaryTint,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  mapLinkText: {
    color: Brand.primary,
  },
  searchBar: {
    minHeight: 52,
    borderRadius: Radius.large,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
  },
  filters: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  filterButton: {
    minHeight: 38,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTextActive: {
    color: Brand.onPrimary,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  list: {
    borderRadius: Radius.large,
    borderWidth: 1,
    overflow: 'hidden',
  },
  rowWrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: `${Brand.charcoal}12`,
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  actionButton: {
    minHeight: 36,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    backgroundColor: Brand.primaryTint,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  actionText: {
    color: Brand.primary,
  },
  pressed: {
    opacity: 0.7,
  },
});

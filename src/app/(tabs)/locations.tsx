import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState, type ElementRef } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { PROVIDER_DEFAULT, type LatLng, type Region } from 'react-native-maps';

import { LocationListItem } from '@/components/locations/location-list-item';
import { LocationMapMarker } from '@/components/locations/location-map-marker';
import { OpenStatusBadge } from '@/components/locations/open-status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EmptyState } from '@/components/ui/empty-state';
import { Brand, MinTouchTarget, Radius, Shadows, Spacing } from '@/constants/theme';
import { QUEENSTOWN_LOCATIONS } from '@/data/locations';
import type { RestaurantLocation } from '@/data/types';
import { useTabBarBottomPadding } from '@/hooks/use-tab-bar-bottom-padding';
import { useTheme } from '@/hooks/use-theme';
import { getDistanceLabel, type DeviceCoordinates } from '@/lib/geo';
import { requestDeviceLocation } from '@/lib/location-permission';
import { getFullAddress } from '@/lib/maps';
import { getLocationStatus, hasBrunchService, hasHappyHourService } from '@/lib/schedule';

type FilterKey = 'all' | 'open' | 'brunch' | 'happy-hour';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open now' },
  { key: 'brunch', label: 'Brunch' },
  { key: 'happy-hour', label: 'Happy hour' },
];

// Static — computed once at module load, never recreated per render, so it
// never causes react-native-maps to think the map's content changed.
const SAN_DIEGO_REGION: Region = {
  latitude: 32.8,
  longitude: -117.19,
  latitudeDelta: 0.32,
  longitudeDelta: 0.32,
};

const ALL_MARKER_COORDINATES: LatLng[] = QUEENSTOWN_LOCATIONS.filter(
  (location) => location.coordinates !== null
).map((location) => location.coordinates as LatLng);

// Collapsed / half-open / expanded. Percentages (not pixel heights) so the
// sheet naturally adapts to any screen size; `topInset` below keeps the
// expanded state clear of the status bar.
const SNAP_POINTS = ['18%', '48%', '90%'] as const;
const SNAP_INDEX = { collapsed: 0, half: 1, expanded: 2 } as const;

export default function LocationsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarBottomPadding = useTabBarBottomPadding();

  const mapRef = useRef<MapView>(null);
  const sheetRef = useRef<BottomSheet>(null);
  const listRef = useRef<ElementRef<typeof BottomSheetFlatList>>(null);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewLocation, setPreviewLocation] = useState<RestaurantLocation | null>(null);
  const [deviceCoords, setDeviceCoords] = useState<DeviceCoordinates | null>(null);
  const [sheetIndex, setSheetIndex] = useState<number>(SNAP_INDEX.collapsed);

  const snapPoints = useMemo<string[]>(() => [...SNAP_POINTS], []);

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

  // The only place the map camera is ever moved. Never called from an
  // effect or from render — only from the explicit handlers below.
  const focusLocation = useCallback((location: RestaurantLocation) => {
    if (!location.coordinates) return;
    mapRef.current?.animateToRegion(
      {
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      350
    );
  }, []);

  const selectFromList = useCallback(
    (location: RestaurantLocation) => {
      setSelectedId(location.id);
      setPreviewLocation(null);
      focusLocation(location); // one intentional camera movement
      router.push(`/locations/${location.id}`);
    },
    [focusLocation, router]
  );

  const selectFromMarker = useCallback(
    (location: RestaurantLocation) => {
      setSelectedId(location.id);
      setPreviewLocation(location);
      focusLocation(location); // one intentional camera movement
      sheetRef.current?.snapToIndex(SNAP_INDEX.half); // one intentional sheet movement
      const index = filteredLocations.findIndex((item) => item.id === location.id);
      if (index >= 0) {
        listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.1 });
      }
    },
    [filteredLocations, focusLocation]
  );

  const useMyLocation = () => {
    Alert.alert(
      'Use My Location?',
      'Queenstown Rewards will use your location to center the map and show distances to each restaurant.',
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Allow',
          onPress: async () => {
            const result = await requestDeviceLocation();
            if (result.granted) {
              setDeviceCoords(result.coordinates);
              mapRef.current?.animateToRegion(
                {
                  latitude: result.coordinates.latitude,
                  longitude: result.coordinates.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                },
                350
              );
            } else {
              Alert.alert(
                'Location unavailable',
                'You can still search and browse every Queenstown location without sharing your location.'
              );
            }
          },
        },
      ]
    );
  };

  const recenterMap = () => {
    if (ALL_MARKER_COORDINATES.length === 0) return;
    mapRef.current?.fitToCoordinates(ALL_MARKER_COORDINATES, {
      edgePadding: { top: 80, right: 60, bottom: 40, left: 60 },
      animated: true,
    });
  };

  const openDirectionsFromPreview = () => {
    if (!previewLocation) return;
    router.push(`/locations/${previewLocation.id}`);
  };

  const renderRow = useCallback(
    ({ item }: { item: RestaurantLocation }) => (
      <LocationListItem
        location={item}
        isSelected={selectedId === item.id}
        distanceLabel={getDistanceLabel(deviceCoords, item.coordinates)}
        onPress={() => selectFromList(item)}
      />
    ),
    [deviceCoords, selectFromList, selectedId]
  );

  return (
    <ThemedView style={styles.flex}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={SAN_DIEGO_REGION}
        showsUserLocation={!!deviceCoords}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
        accessibilityLabel="Map of Queenstown Hospitality Group locations in San Diego"
      >
        {QUEENSTOWN_LOCATIONS.map((location) => (
          <LocationMapMarker
            key={location.id}
            location={location}
            isSelected={selectedId === location.id}
            onPress={() => selectFromMarker(location)}
          />
        ))}
      </MapView>

      <SafeAreaView edges={['top', 'left', 'right']} style={styles.topOverlay} pointerEvents="box-none">
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

        <View style={styles.filterRow}>
          {FILTERS.map(({ key, label }) => {
            const active = filter === key;
            return (
              <Pressable
                key={key}
                onPress={() => setFilter(key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Filter: ${label}`}
                style={[
                  styles.filterChip,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  active && { backgroundColor: Brand.primary, borderColor: Brand.primary },
                ]}
              >
                <ThemedText
                  type="small"
                  style={active ? styles.filterLabelActive : { color: theme.textSecondary }}
                >
                  {label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>

      <View style={[styles.mapControls, { bottom: SNAP_POINTS[sheetIndex] }]} pointerEvents="box-none">
        <MapControlButton icon="locate" accessibilityLabel="Use my location" onPress={useMyLocation} />
        <MapControlButton
          icon="scan"
          accessibilityLabel="Recenter map on all locations"
          onPress={recenterMap}
        />
      </View>

      {previewLocation && (
        <Pressable
          onPress={openDirectionsFromPreview}
          accessibilityRole="button"
          accessibilityLabel={`View details for ${previewLocation.name}`}
          style={[
            styles.previewCard,
            {
              bottom: SNAP_POINTS[sheetIndex],
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.previewRule} />
          <View style={styles.previewText}>
            <ThemedText type="eyebrow">Selected restaurant</ThemedText>
            <ThemedText type="smallBold">{previewLocation.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {previewLocation.neighbourhood}
            </ThemedText>
          </View>
          <OpenStatusBadge status={getLocationStatus(previewLocation)} />
          <Ionicons name="chevron-forward" size={18} color={Brand.primary} />
        </Pressable>
      )}

      <BottomSheet
        ref={sheetRef}
        index={SNAP_INDEX.collapsed}
        snapPoints={snapPoints}
        topInset={insets.top}
        onChange={setSheetIndex}
        enableContentPanningGesture
        enableHandlePanningGesture
        enablePanDownToClose={false}
        backgroundStyle={{ backgroundColor: theme.backgroundElement }}
        handleIndicatorStyle={{ backgroundColor: theme.border }}
        style={styles.sheetShadow}
      >
        <View style={styles.sheetHeader}>
          <ThemedText type="small" themeColor="textSecondary">
            {previewLocation
              ? previewLocation.name
              : `${filteredLocations.length} ${filteredLocations.length === 1 ? 'location' : 'locations'}`}
          </ThemedText>
        </View>

        {filteredLocations.length === 0 ? (
          <EmptyState
            icon="location-outline"
            title="No matching locations"
            message="Try a different search or filter."
          />
        ) : (
          <BottomSheetFlatList
            ref={listRef}
            data={filteredLocations}
            keyExtractor={(location) => location.id}
            contentContainerStyle={{ paddingBottom: tabBarBottomPadding }}
            onScrollToIndexFailed={() => {}}
            renderItem={renderRow}
          />
        )}
      </BottomSheet>
    </ThemedView>
  );
}

function MapControlButton({
  icon,
  accessibilityLabel,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.controlButton, pressed && styles.controlButtonPressed]}
    >
      <Ionicons name={icon} size={22} color={Brand.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.three,
    minHeight: MinTouchTarget + 4,
    borderWidth: 1,
    ...Shadows.card,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    minHeight: MinTouchTarget,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  filterChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
    ...Shadows.card,
  },
  filterLabelActive: {
    color: Brand.onPrimary,
    fontWeight: '700',
  },
  mapControls: {
    position: 'absolute',
    right: Spacing.three,
    gap: Spacing.two,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Brand.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.raised,
  },
  controlButtonPressed: {
    opacity: 0.75,
  },
  previewCard: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.medium,
    borderWidth: 1,
    padding: Spacing.three,
    ...Shadows.raised,
  },
  previewRule: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: Radius.pill,
    backgroundColor: Brand.primary,
  },
  previewText: {
    flex: 1,
    gap: 2,
  },
  sheetShadow: {
    ...Shadows.raised,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingBottom: Spacing.two,
  },
});

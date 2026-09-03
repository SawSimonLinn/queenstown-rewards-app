import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState, type ElementRef } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { PROVIDER_DEFAULT, type LatLng, type Region } from 'react-native-maps';

import { LocationListItem } from '@/components/locations/location-list-item';
import { LocationMapMarker } from '@/components/locations/location-map-marker';
import { OpenStatusBadge } from '@/components/locations/open-status-badge';
import { PreferredLocationStar } from '@/components/locations/preferred-location-star';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EmptyState } from '@/components/ui/empty-state';
import { FadeInView } from '@/components/ui/motion';
import { Brand, MinTouchTarget, Radius, Shadows, Spacing } from '@/constants/theme';
import { QUEENSTOWN_LOCATIONS } from '@/data/locations';
import type { RestaurantLocation } from '@/data/types';
import { TAB_BAR_CONTENT_HEIGHT, useTabBarBottomPadding } from '@/hooks/use-tab-bar-bottom-padding';
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

// Collapsed / half-open / expanded, as a fraction of the *usable* viewport —
// the window height minus the top safe-area inset and the bottom tab-bar
// assembly (its own content height plus the bottom safe-area inset). Gorhom's
// own percentage snap points are relative to the full container height and
// don't know about the tab bar, which is why these are computed in pixels
// per-render (see `useSheetSnapPoints` below) rather than passed as strings.
const SHEET_FRACTIONS = { collapsed: 0.3, half: 0.55, expanded: 0.92 } as const;
const SNAP_INDEX = { collapsed: 0, half: 1, expanded: 2 } as const;

/**
 * Pixel snap points for the locations bottom sheet, sized so the collapsed
 * state shows exactly `SHEET_FRACTIONS.collapsed` of the usable viewport
 * (window height minus top inset minus the tab-bar assembly) fully above the
 * tab bar's top edge — not just above the home indicator.
 *
 * Gorhom's `BottomSheet` (non-detached) always anchors its bottom to the
 * window's bottom edge, so each snap point's pixel height must include the
 * space the tab bar occludes (`tabBarOcclusion`) in addition to the visible
 * portion we actually want on screen; the sheet's own bottom padding (see
 * `tabBarBottomPadding` on the list) reserves that same space so content
 * never renders underneath the tab bar.
 */
function useSheetSnapPoints() {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const tabBarOcclusion = insets.bottom + TAB_BAR_CONTENT_HEIGHT;
    const usableHeight = windowHeight - insets.top - tabBarOcclusion;

    return [
      usableHeight * SHEET_FRACTIONS.collapsed + tabBarOcclusion,
      usableHeight * SHEET_FRACTIONS.half + tabBarOcclusion,
      usableHeight * SHEET_FRACTIONS.expanded + tabBarOcclusion,
    ];
  }, [windowHeight, insets.top, insets.bottom]);
}

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

  const snapPoints = useSheetSnapPoints();

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

      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={styles.topOverlay}
        pointerEvents="box-none"
      >
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

      <View
        style={[styles.mapControls, { bottom: snapPoints[sheetIndex] }]}
        pointerEvents="box-none"
      >
        <MapControlButton
          icon="locate"
          accessibilityLabel="Use my location"
          onPress={useMyLocation}
        />
        <MapControlButton
          icon="scan"
          accessibilityLabel="Recenter map on all locations"
          onPress={recenterMap}
        />
      </View>

      {previewLocation && (
        <FadeInView
          key={previewLocation.id}
          slide
          style={[
            styles.previewCard,
            {
              bottom: snapPoints[sheetIndex],
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
            },
          ]}
        >
          <Pressable
            onPress={openDirectionsFromPreview}
            accessibilityRole="button"
            accessibilityLabel={`View details for ${previewLocation.name}`}
            style={({ pressed }) => [styles.previewPressable, pressed && styles.previewPressed]}
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
            <PreferredLocationStar location={previewLocation} size={20} />
            <Ionicons name="chevron-forward" size={18} color={Brand.primary} />
          </Pressable>
        </FadeInView>
      )}

      <BottomSheet
        ref={sheetRef}
        index={SNAP_INDEX.collapsed}
        snapPoints={snapPoints}
        topInset={insets.top}
        onChange={setSheetIndex}
        enableDynamicSizing={false}
        enableContentPanningGesture
        enableHandlePanningGesture
        enablePanDownToClose={false}
        backgroundStyle={{ backgroundColor: theme.backgroundElement }}
        handleIndicatorStyle={{ backgroundColor: theme.border }}
        style={styles.sheetShadow}
      >
        <View style={styles.sheetHeader}>
          <ThemedText type="subtitle">
            {previewLocation
              ? previewLocation.name
              : `${filteredLocations.length} ${filteredLocations.length === 1 ? 'Location' : 'Locations'}`}
          </ThemedText>
        </View>

        {filteredLocations.length === 0 ? (
          <FadeInView>
            <EmptyState
              icon="location-outline"
              title="No matching locations"
              message="Try a different search or filter."
            />
          </FadeInView>
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
    borderRadius: Radius.medium,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.raised,
  },
  previewPressable: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  previewPressed: {
    opacity: 0.82,
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

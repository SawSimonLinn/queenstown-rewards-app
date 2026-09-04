import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OpenStatusBadge } from '@/components/locations/open-status-badge';
import { PreferredLocationStar } from '@/components/locations/preferred-location-star';
import { WeeklySchedule } from '@/components/locations/weekly-schedule';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { FadingImage } from '@/components/ui/fading-image';
import { Brand, IconSize, MinTouchTarget, Radius, Shadows, Spacing } from '@/constants/theme';
import { getRestaurantLocationById } from '@/data/locations';
import { getLocationImages } from '@/data/location-images';
import type { RestaurantLocation } from '@/data/types';
import { useBrand } from '@/hooks/use-brand';
import { useTabBarBottomPadding } from '@/hooks/use-tab-bar-bottom-padding';
import { getDirectionsUrl, getFullAddress, getPhoneCallUrl } from '@/lib/maps';
import {
  getLocationStatus,
  getTodayHoursLabel,
  hasBrunchService,
  hasHappyHourService,
} from '@/lib/schedule';

function useGoBackToLocations() {
  const router = useRouter();
  const hasNavigatedRef = useRef(false);

  return () => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/locations');
    }
  };
}

export default function LocationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const location = getRestaurantLocationById(id);
  const tabBarBottomPadding = useTabBarBottomPadding();
  const goBack = useGoBackToLocations();

  return (
    <ThemedView style={styles.flex}>
      {location ? (
        <LocationDetail location={location} bottomPadding={tabBarBottomPadding} />
      ) : (
        <SafeAreaView style={styles.flex}>
          <View style={styles.notFoundBack}>
            <Pressable
              onPress={goBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
            >
              <Ionicons name="chevron-back" size={IconSize.large} color={Brand.charcoal} />
            </Pressable>
          </View>
          <View style={styles.padded}>
            <Card accessibilityLabel="Location not found">
              <ThemedText themeColor="textSecondary">
                This location couldn&apos;t be found.
              </ThemedText>
            </Card>
          </View>
        </SafeAreaView>
      )}
    </ThemedView>
  );
}

function LocationDetail({
  location,
  bottomPadding,
}: {
  location: RestaurantLocation;
  bottomPadding: number;
}) {
  const router = useRouter();
  const brand = useBrand();
  const goBack = useGoBackToLocations();
  const status = getLocationStatus(location);
  const images = getLocationImages(location.id);
  const [weeklyExpanded, setWeeklyExpanded] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const brunch = hasBrunchService(location);
  const happyHour = hasHappyHourService(location);

  const openDirections = async () => {
    const url = getDirectionsUrl(location);
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert("Can't open maps", 'No maps app is available to show directions.');
    }
  };

  const confirmCall = () => {
    if (!location.phone) return;
    Alert.alert(`Call ${location.name}?`, location.phone, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => Linking.openURL(getPhoneCallUrl(location.phone!)) },
    ]);
  };

  const openWebsite = () => {
    if (!location.website) return;
    Linking.openURL(location.website);
  };

  const shareLocation = () => {
    Share.share({
      message: `${location.name} — ${getFullAddress(location)}${
        location.website ? `\n${location.website}` : ''
      }`,
    });
  };

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <FadingImage
            source={images.hero}
            height="100%"
            radius={0}
            style={StyleSheet.absoluteFill}
            fallbackIcon="storefront"
            fallbackLabel={location.name}
          />

          <SafeAreaView edges={['top']} style={styles.heroTopBar}>
            <HeroIconButton icon="chevron-back" accessibilityLabel="Go back" onPress={goBack} />
            <View style={styles.heroTopRight}>
              <HeroIconButton
                icon="share-outline"
                accessibilityLabel="Share this location"
                onPress={shareLocation}
              />
            </View>
          </SafeAreaView>

          {images.logo && (
            <View style={styles.heroLogoWrap}>
              <FadingImage
                source={images.logo}
                width={56}
                height={56}
                radius={28}
                contentFit="contain"
                fallbackIcon="storefront"
                fallbackSize="small"
              />
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Summary */}
          <View style={styles.summaryGroup}>
            <View style={styles.nameRow}>
              <ThemedText type="display" style={styles.name}>
                {location.name}
              </ThemedText>
              <PreferredLocationStar location={location} size={26} showLabel />
            </View>
            <ThemedText type="smallBold" themeColor="textSecondary">
              {location.neighbourhood}
            </ThemedText>

            <View style={styles.badgeRow}>
              <OpenStatusBadge status={status} />
            </View>

            <ThemedText type="small" themeColor="textSecondary">
              Today: {getTodayHoursLabel(location)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {getFullAddress(location)}
            </ThemedText>
            {location.description && (
              <ThemedText style={styles.description}>{location.description}</ThemedText>
            )}
          </View>

          {/* Primary actions */}
          <View style={styles.actionGrid}>
            {location.phone && (
              <ActionButton icon="call-outline" label="Call" onPress={confirmCall} />
            )}
            <ActionButton icon="navigate-outline" label="Directions" onPress={openDirections} />
            {location.website && (
              <ActionButton icon="globe-outline" label="Website" onPress={openWebsite} />
            )}
          </View>

          {/* Burger Club */}
          <View
            style={[
              styles.clubCard,
              { borderColor: `${brand.secondary}55`, backgroundColor: `${brand.secondary}14` },
            ]}
          >
            <View style={styles.clubHeaderRow}>
              <Ionicons name="gift" size={IconSize.medium} color={brand.secondaryDark} />
              <ThemedText type="smallBold" style={[styles.clubTitle, { color: brand.secondaryDark }]}>
                Burger of the Month Club
              </ThemedText>
            </View>
            <ThemedText type="smallBold">A new burger. On us. Every month.</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              With another qualifying entrée
            </ThemedText>
            <ThemedText type="small" style={styles.clubStatus}>
              {location.currentlyParticipating
                ? `${location.name} is a participating Burger Club location.`
                : `${location.name} is not currently a Burger Club location.`}
            </ThemedText>
            <View style={styles.clubActions}>
              <Pressable
                onPress={() => router.push('/(tabs)/rewards')}
                accessibilityRole="button"
                accessibilityLabel="View reward"
                style={[styles.clubActionButton, { backgroundColor: brand.secondary }]}
              >
                <ThemedText type="smallBold" style={[styles.clubActionLabel, { color: brand.onSecondary }]}>
                  View Reward
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => router.push('/burger-club/terms')}
                accessibilityRole="button"
                accessibilityLabel="View terms"
                style={[styles.clubActionButtonGhost, { borderColor: brand.secondaryDark }]}
              >
                <ThemedText type="smallBold" style={[styles.clubActionGhostLabel, { color: brand.secondaryDark }]}>
                  View Terms
                </ThemedText>
              </Pressable>
            </View>
          </View>

          {/* Weekly hours */}
          <Section title="Hours" icon="time-outline">
            {location.hoursUnconfirmed ? (
              <ThemedText themeColor="textSecondary">
                Contact the restaurant to confirm today&apos;s hours.
              </ThemedText>
            ) : (
              <WeeklySchedule
                location={location}
                expanded={weeklyExpanded}
                onToggleExpanded={() => setWeeklyExpanded((value) => !value)}
              />
            )}
          </Section>

          {/* Additional information */}
          {(brunch || happyHour || location.specialServiceHours?.length) && (
            <Section title="Additional information" icon="sparkles-outline">
              {brunch && (
                <InfoRow
                  label="Brunch"
                  value="Verified weekend brunch service — see hours above."
                />
              )}
              {location.specialServiceHours?.map((service) => (
                <InfoRow
                  key={service.id}
                  label={service.label}
                  value={service.note ?? 'See hours above for timing.'}
                />
              ))}
            </Section>
          )}

          <Section title="Contact" icon="call-outline">
            <InfoRow label="Address" value={getFullAddress(location)} />
            {location.phone && <InfoRow label="Phone" value={location.phone} />}
            {location.website && <InfoRow label="Website" value={location.website} />}
          </Section>

          {/* Photo gallery */}
          {images.gallery.length > 0 && (
            <View style={styles.gallerySection}>
              <ThemedText type="smallBold" style={styles.galleryTitle}>
                Photos
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.galleryScroll}
              >
                {images.gallery.map((source, index) => (
                  <Pressable key={index} onPress={() => setViewerIndex(index)}>
                    <FadingImage
                      source={source}
                      width={160}
                      height={120}
                      radius={Radius.medium}
                      style={styles.galleryImage}
                      fallbackIcon="image-outline"
                      fallbackSize="small"
                    />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={viewerIndex !== null} transparent animationType="fade">
        <View style={styles.viewerBackdrop}>
          <Pressable
            style={styles.viewerClose}
            accessibilityRole="button"
            accessibilityLabel="Close photo"
            onPress={() => setViewerIndex(null)}
          >
            <Ionicons name="close" size={28} color={Brand.onPrimary} />
          </Pressable>
          {viewerIndex !== null && images.gallery[viewerIndex] && (
            <FadingImage
              source={images.gallery[viewerIndex]}
              width="100%"
              height="80%"
              radius={0}
              style={styles.viewerImage}
              contentFit="contain"
              fallbackIcon="image-outline"
            />
          )}
        </View>
      </Modal>
    </>
  );
}

function HeroIconButton({
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
      hitSlop={2}
      style={({ pressed }) => [styles.heroButton, pressed && styles.heroButtonPressed]}
    >
      <Ionicons name={icon} size={20} color={Brand.charcoal} />
    </Pressable>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: ReactNode;
}) {
  const brand = useBrand();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={IconSize.medium} color={brand.primary} />
        <ThemedText type="smallBold">{title}</ThemedText>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.infoLabel}>
        {label}
      </ThemedText>
      <ThemedText type="small" style={styles.infoValue}>
        {value}
      </ThemedText>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const brand = useBrand();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        { borderColor: `${brand.primary}40` },
        pressed && styles.pressedAction,
      ]}
    >
      <Ionicons name={icon} size={IconSize.medium} color={brand.primary} />
      <ThemedText type="smallBold" style={[styles.actionLabel, { color: brand.primaryDark }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: Spacing.four,
  },
  notFoundBack: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  hero: {
    height: 280,
    backgroundColor: Brand.mutedSurface,
  },
  heroTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  heroTopRight: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  heroButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: `${Brand.onPrimary}E6`,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  heroButtonPressed: {
    opacity: 0.75,
  },
  heroLogoWrap: {
    position: 'absolute',
    bottom: -28,
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Brand.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.raised,
  },
  heroLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  summaryGroup: {
    gap: Spacing.one,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  name: {
    color: Brand.charcoal,
    flexShrink: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  description: {
    marginTop: Spacing.one,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  actionButton: {
    minHeight: 54,
    minWidth: 90,
    flexGrow: 1,
    flexBasis: 0,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderColor: `${Brand.primary}40`,
    backgroundColor: Brand.onPrimary,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  pressedAction: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
  actionLabel: {
    color: Brand.primaryDark,
  },
  clubCard: {
    borderRadius: Radius.large,
    borderWidth: 1,
    borderColor: `${Brand.secondary}55`,
    backgroundColor: `${Brand.secondary}14`,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  clubHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: 2,
  },
  clubTitle: {
    color: Brand.secondaryDark,
  },
  clubStatus: {
    marginTop: Spacing.one,
  },
  clubActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  clubActionButton: {
    minHeight: MinTouchTarget,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
    backgroundColor: Brand.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubActionLabel: {
    color: Brand.onSecondary,
  },
  clubActionButtonGhost: {
    minHeight: MinTouchTarget,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderColor: Brand.secondaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubActionGhostLabel: {
    color: Brand.secondaryDark,
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: `${Brand.charcoal}14`,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sectionBody: {
    gap: Spacing.two,
  },
  infoRow: {
    gap: 2,
  },
  infoLabel: {
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 0.4,
  },
  infoValue: {},
  gallerySection: {
    gap: Spacing.two,
  },
  galleryTitle: {},
  galleryScroll: {
    marginHorizontal: -Spacing.four,
  },
  galleryImage: {
    width: 160,
    height: 120,
    borderRadius: Radius.medium,
    marginLeft: Spacing.four,
    backgroundColor: Brand.mutedSurface,
  },
  viewerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(23,23,23,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerClose: {
    position: 'absolute',
    top: 56,
    right: 24,
    zIndex: 1,
  },
  viewerImage: {
    width: '100%',
    height: '80%',
  },
});

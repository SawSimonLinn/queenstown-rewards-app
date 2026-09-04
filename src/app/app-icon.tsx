import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Radius, Spacing } from '@/constants/theme';
import { useBrand } from '@/hooks/use-brand';
import { getErrorMessage } from '@/lib/errors';

type AlternateAppIconsModule = {
  supportsAlternateIcons: boolean;
  getAppIconName: () => string | null;
  setAlternateAppIcon: (name: string | null) => Promise<string | null>;
};

/**
 * `expo-alternate-app-icons` calls `requireNativeModule()` at import time,
 * which throws until the app has been rebuilt with the config plugin applied
 * (a fresh `expo prebuild` + dev client/store build). expo-router eagerly
 * imports every file under `app/` to build its route tree, so a static
 * top-level import here would crash the whole `<Stack>` on any build that
 * predates the rebuild — load it lazily and fall back to "unsupported".
 */
function loadAlternateAppIcons(): AlternateAppIconsModule | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-alternate-app-icons');
  } catch {
    return null;
  }
}

const alternateAppIcons = loadAlternateAppIcons();

const ICON_OPTIONS = [
  { name: null, label: 'Default', source: require('../../assets/images/icon.png') },
  {
    name: 'Black',
    label: 'Black',
    source: require('../../assets/images/app-icons/icon-black.png'),
  },
  { name: 'Blue', label: 'Blue', source: require('../../assets/images/app-icons/icon-blue.png') },
  {
    name: 'Green',
    label: 'Green',
    source: require('../../assets/images/app-icons/icon-green.png'),
  },
  {
    name: 'Orange',
    label: 'Orange',
    source: require('../../assets/images/app-icons/icon-orange.png'),
  },
  { name: 'Red', label: 'Red', source: require('../../assets/images/app-icons/icon-red.png') },
  {
    name: 'White',
    label: 'White',
    source: require('../../assets/images/app-icons/icon-white.png'),
  },
] as const;

export default function AppIconScreen() {
  const brand = useBrand();
  const [selected, setSelected] = useState<string | null>(
    () => alternateAppIcons?.getAppIconName() ?? null
  );
  const [pending, setPending] = useState<string | null>(null);

  if (!alternateAppIcons?.supportsAlternateIcons) {
    return (
      <ScreenContainer>
        <ThemedText themeColor="textSecondary">
          Changing the app icon isn&apos;t supported on this device.
        </ThemedText>
      </ScreenContainer>
    );
  }

  const handleSelect = async (name: string | null) => {
    if (name === selected || pending) return;
    setPending(name ?? 'default');
    try {
      await alternateAppIcons.setAlternateAppIcon(name);
      setSelected(name);
    } catch (error) {
      Alert.alert("Couldn't change icon", getErrorMessage(error, 'Please try again.'));
    } finally {
      setPending(null);
    }
  };

  return (
    <ScreenContainer scroll>
      <ThemedText themeColor="textSecondary">
        Choose the icon shown for Queenstown Rewards on your home screen.
      </ThemedText>

      <View style={styles.grid}>
        {ICON_OPTIONS.map((option) => {
          const isSelected = selected === option.name;
          const isPending = pending === (option.name ?? 'default');

          return (
            <Pressable
              key={option.label}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: isSelected }}
              onPress={() => handleSelect(option.name)}
              disabled={pending !== null}
              style={styles.swatch}
            >
              <View
                style={[
                  styles.imageWrap,
                  isSelected && { borderColor: brand.primary },
                ]}
              >
                <Image source={option.source} style={styles.image} />
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: brand.primary }]}>
                    <Ionicons name="checkmark" size={14} color={brand.onPrimary} />
                  </View>
                )}
                {isPending && (
                  <View style={styles.pendingOverlay}>
                    <Ionicons name="hourglass-outline" size={20} color={brand.onPrimary} />
                  </View>
                )}
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
  },
  swatch: {
    alignItems: 'center',
    gap: Spacing.two,
    width: 84,
  },
  imageWrap: {
    width: 72,
    height: 72,
    borderRadius: Radius.large,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  checkBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 20,
    height: 20,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

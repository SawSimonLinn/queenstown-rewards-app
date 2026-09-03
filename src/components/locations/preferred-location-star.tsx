import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Brand, MinTouchTarget, Radius } from '@/constants/theme';
import type { RestaurantLocation } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { getErrorMessage } from '@/lib/errors';
import { usePreferredLocation } from '@/lib/preferred-location';

export type PreferredLocationStarProps = {
  location: RestaurantLocation;
  size?: number;
  /** Solid backdrop behind the star — for use over photos/map previews. */
  variant?: 'plain' | 'scrim';
  /** Shows a "Preferred location" caption beneath the star when it's set. Location Details only. */
  showLabel?: boolean;
};

/**
 * Star toggle for setting a location as the signed-in user's preferred
 * location. Reused on location cards, the map preview card, and Location
 * Details. Source of truth is the Supabase profile via
 * `usePreferredLocation` — this component never holds the preference itself,
 * only its own in-flight saving state.
 */
export function PreferredLocationStar({
  location,
  size = 22,
  variant = 'plain',
  showLabel = false,
}: PreferredLocationStarProps) {
  const router = useRouter();
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const { session } = useAuth();
  const { preferredLocation, savePreferredLocation, setPendingLocationId } = usePreferredLocation();
  const [isSaving, setIsSaving] = useState(false);
  const isPreferred = preferredLocation?.id === location.id;
  const previousIsPreferredRef = useRef(isPreferred);
  const scale = useSharedValue(1);

  useEffect(() => {
    const becamePreferred = isPreferred && !previousIsPreferredRef.current;
    previousIsPreferredRef.current = isPreferred;

    if (!becamePreferred || reduceMotion) {
      scale.value = 1;
      return;
    }

    scale.value = 0.9;
    scale.value = withSequence(
      withTiming(1.12, { duration: 120, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) })
    );
  }, [isPreferred, reduceMotion, scale]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async () => {
    if (isSaving) return;
    // Tapping the already-preferred star is a no-op — changing the
    // preference only ever happens by picking a different location.
    if (isPreferred) return;

    if (!session) {
      setPendingLocationId(location.id);
      router.push('/(auth)/login');
      return;
    }

    setIsSaving(true);
    try {
      await savePreferredLocation(location);
      Alert.alert('Preferred location updated', `${location.name} is now your preferred location.`);
    } catch (error) {
      Alert.alert("Couldn't update preferred location", getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const accessibilityLabel = isPreferred
    ? `${location.name} is your preferred location`
    : `Set ${location.name} as preferred location`;

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={handlePress}
        disabled={isSaving}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected: isPreferred, disabled: isSaving, busy: isSaving }}
        hitSlop={variant === 'scrim' ? 0 : 8}
        style={({ pressed }) => [
          styles.button,
          variant === 'scrim' && styles.buttonScrim,
          pressed && !isSaving && styles.buttonPressed,
        ]}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color={Brand.primary} />
        ) : (
          <Animated.View style={animatedIconStyle}>
            <Ionicons
              name={isPreferred ? 'star' : 'star-outline'}
              size={size}
              color={
                isPreferred ? Brand.primary : variant === 'scrim' ? Brand.charcoal : theme.textMuted
              }
            />
          </Animated.View>
        )}
      </Pressable>
      {showLabel && isPreferred && (
        <ThemedText type="eyebrow" style={styles.label}>
          Preferred location
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  button: {
    minWidth: MinTouchTarget,
    minHeight: MinTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  buttonScrim: {
    backgroundColor: `${Brand.onPrimary}E6`,
  },
  buttonPressed: {
    opacity: 0.65,
  },
  label: {
    color: Brand.primary,
    marginTop: -4,
  },
});

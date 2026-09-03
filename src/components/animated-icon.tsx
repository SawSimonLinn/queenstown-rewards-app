import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { Easing, Keyframe, useReducedMotion } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { ThemedText } from '@/components/themed-text';
import { Brand, Radius, Spacing } from '@/constants/theme';

const DURATION = 600;

export type AnimatedSplashOverlayProps = {
  /**
   * True once every piece of startup data the preloader is meant to cover
   * (session, profile, preferred location, membership, fonts) has resolved.
   * The native splash hides on first layout regardless — its replacement
   * (below) is visually identical — but the transition into the real app
   * only begins once this flips true, so nothing behind the overlay is ever
   * visible mid-restore.
   */
  ready: boolean;
};

export function AnimatedSplashOverlay({ ready }: AnimatedSplashOverlayProps) {
  const reduceMotion = useReducedMotion();
  const [hasHiddenNativeSplash, setHasHiddenNativeSplash] = useState(false);
  const [visible, setVisible] = useState(true);
  // Once the native splash is hidden behind this (visually identical)
  // overlay, the transition-out animation only starts once startup data is
  // actually ready — derived directly from props/state rather than mirrored
  // into its own state to avoid a redundant extra render.
  const animate = ready && hasHiddenNativeSplash;

  if (!visible) return null;

  const splashKeyframe = reduceMotion
    ? new Keyframe({
        0: { opacity: 1 },
        100: { opacity: 0, easing: Easing.out(Easing.quad) },
      })
    : new Keyframe({
        0: {
          transform: [{ scale: 1 }],
          opacity: 1,
        },
        100: {
          opacity: 0,
          transform: [{ scale: 0.985 }],
          easing: Easing.out(Easing.cubic),
        },
      });

  const content = (
    <SafeAreaView style={styles.content}>
      <View style={styles.brandMark}>
        <ThemedText type="display" style={styles.brandMarkText}>
          Q
        </ThemedText>
      </View>
      <ActivityIndicator size="small" color={Brand.primary} style={styles.spinner} />
      <ThemedText type="small" themeColor="textSecondary">
        Preparing your rewards
      </ThemedText>
    </SafeAreaView>
  );

  return animate ? (
    <Animated.View
      entering={splashKeyframe.duration(reduceMotion ? 140 : DURATION).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.splashOverlay}
    >
      {content}
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setHasHiddenNativeSplash(true);
        });
      }}
      style={styles.splashOverlay}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  brandMark: {
    width: 76,
    height: 76,
    borderRadius: Radius.large,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  brandMarkText: {
    color: Brand.onPrimary,
  },
  spinner: {
    marginTop: Spacing.three,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Brand.cream,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});

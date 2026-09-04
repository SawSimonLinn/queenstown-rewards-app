import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  Keyframe,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { ThemedText } from '@/components/themed-text';
import { Brand, Radius, Spacing } from '@/constants/theme';

const DURATION = 600;

/**
 * The splash stays up for at least this long even if startup data (session,
 * profile, preferred location, membership) resolves instantly, so the brand
 * moment always gets to play out rather than flashing by.
 */
const MIN_VISIBLE_MS = 3000;

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
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, []);

  // Once the native splash is hidden behind this (visually identical)
  // overlay, the transition-out animation only starts once startup data is
  // actually ready and the minimum brand-moment duration has played out —
  // derived directly from props/state rather than mirrored into its own
  // state to avoid a redundant extra render.
  const animate = ready && hasHiddenNativeSplash && minTimeElapsed;

  const pulse = useSharedValue(1);
  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
  }, [pulse, reduceMotion]);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

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
      <Animated.View style={[styles.brandMark, pulseStyle]}>
        <ThemedText type="display" style={styles.brandMarkText}>
          Q
        </ThemedText>
      </Animated.View>
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
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Brand.cream,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});

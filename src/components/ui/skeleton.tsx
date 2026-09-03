import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SkeletonBlockProps = {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

/** A single pulsing placeholder block. Prefer the higher-level skeleton screens below. */
export function SkeletonBlock({
  width = '100%',
  height = 16,
  radius = Radius.small,
  style,
}: SkeletonBlockProps) {
  const theme = useTheme();
  const [opacity] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: theme.surfaceSunken, opacity },
        style,
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}

export function CardSkeleton() {
  const theme = useTheme();
  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
      accessibilityLabel="Loading content"
    >
      <SkeletonBlock width={96} height={12} />
      <SkeletonBlock width="70%" height={22} />
      <SkeletonBlock width="100%" height={14} />
      <SkeletonBlock width="85%" height={14} />
    </View>
  );
}

export function HeroCardSkeleton() {
  const theme = useTheme();
  return (
    <View
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
      accessibilityLabel="Loading Burger of the Month"
    >
      <SkeletonBlock width="100%" height={160} radius={Radius.medium} />
      <SkeletonBlock width={140} height={12} style={{ marginTop: Spacing.two }} />
      <SkeletonBlock width="60%" height={24} />
      <SkeletonBlock width="90%" height={14} />
      <SkeletonBlock
        width={160}
        height={44}
        radius={Radius.medium}
        style={{ marginTop: Spacing.two }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
    gap: Spacing.two,
  },
});

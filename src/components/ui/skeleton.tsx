import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, type ReactNode } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

function SkeletonBase({
  width = '100%',
  height = 16,
  radius = Radius.small,
  style,
}: SkeletonProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const { width: windowWidth } = useWindowDimensions();
  const progress = useSharedValue(0);
  const shimmerWidth = Math.max(windowWidth, 320);

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(progress);
      progress.value = 0;
      return;
    }

    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, {
        duration: 1350,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      false
    );

    return () => cancelAnimation(progress);
  }, [progress, reduceMotion]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [-shimmerWidth, shimmerWidth]),
      },
    ],
  }));

  return (
    <View
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.block,
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: theme.surfaceSunken,
        },
        style,
      ]}
    >
      {!reduceMotion && (
        <Animated.View
          pointerEvents="none"
          style={[styles.shimmer, { width: shimmerWidth }, shimmerStyle]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.52)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </View>
  );
}

export const Skeleton = memo(SkeletonBase);

export type SkeletonTextProps = {
  lines?: number;
  width?: DimensionValue;
  lastLineWidth?: DimensionValue;
  lineHeight?: number;
  gap?: number;
  style?: StyleProp<ViewStyle>;
};

export function SkeletonText({
  lines = 2,
  width = '100%',
  lastLineWidth = '74%',
  lineHeight = 14,
  gap = Spacing.one,
  style,
}: SkeletonTextProps) {
  return (
    <View style={[{ gap }, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 && lines > 1 ? lastLineWidth : width}
          height={lineHeight}
          radius={Radius.small}
        />
      ))}
    </View>
  );
}

export function SkeletonCircle({
  size = 44,
  style,
}: {
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return <Skeleton width={size} height={size} radius={Radius.pill} style={style} />;
}

export type SkeletonCardProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  noPadding?: boolean;
  accessibilityLabel?: string;
};

export function SkeletonCard({
  children,
  style,
  noPadding = false,
  accessibilityLabel = 'Loading content',
}: SkeletonCardProps) {
  const theme = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: true }}
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        noPadding && styles.cardNoPadding,
        style,
      ]}
    >
      {children ?? (
        <>
          <Skeleton width={96} height={12} />
          <Skeleton width="70%" height={22} />
          <SkeletonText lines={2} />
        </>
      )}
    </View>
  );
}

export function CardSkeleton() {
  return <SkeletonCard />;
}

export function HeroCardSkeleton() {
  return (
    <SkeletonCard accessibilityLabel="Loading featured content">
      <Skeleton width="100%" height={160} radius={Radius.medium} />
      <Skeleton width={140} height={12} style={styles.skeletonTopGap} />
      <Skeleton width="62%" height={24} />
      <SkeletonText lines={2} />
      <Skeleton width={160} height={44} radius={Radius.medium} style={styles.skeletonTopGap} />
    </SkeletonCard>
  );
}

export function LocationCardSkeleton() {
  const theme = useTheme();

  return (
    <View
      accessible
      accessibilityLabel="Loading location"
      accessibilityState={{ busy: true }}
      style={[styles.locationRow, { borderBottomColor: `${Brand.charcoal}12` }]}
    >
      <Skeleton width={52} height={52} radius={Radius.medium} />
      <View style={styles.locationTextGroup}>
        <Skeleton width="78%" height={15} />
        <Skeleton width="54%" height={12} />
        <View style={styles.metaRow}>
          <Skeleton width={74} height={20} radius={Radius.pill} />
          <Skeleton width={20} height={20} radius={Radius.pill} />
        </View>
        <Skeleton width="64%" height={12} />
        <Skeleton width="86%" height={12} />
      </View>
      <View style={styles.locationTrailing}>
        <SkeletonCircle size={28} />
        <Skeleton width={18} height={18} radius={Radius.small} />
      </View>
      <View style={[styles.locationDividerCover, { backgroundColor: theme.backgroundElement }]} />
    </View>
  );
}

export function SpecialCardSkeleton({ feature = false }: { feature?: boolean }) {
  return (
    <SkeletonCard
      noPadding
      accessibilityLabel="Loading special"
      style={[styles.specialCard, feature && styles.specialFeatureCard]}
    >
      <Skeleton width="100%" height={feature ? 132 : 110} radius={0} />
      <View style={styles.specialBody}>
        <View style={styles.specialHeader}>
          <Skeleton width="62%" height={16} />
          <Skeleton width={76} height={22} radius={Radius.pill} />
        </View>
        <Skeleton width="48%" height={12} />
        <SkeletonText lines={2} />
      </View>
    </SkeletonCard>
  );
}

export function ProfileSkeleton() {
  return (
    <View
      accessibilityLabel="Loading profile"
      accessibilityState={{ busy: true }}
      style={styles.screenGroup}
    >
      <SkeletonCard noPadding>
        <View style={styles.profileIdentity}>
          <Skeleton width={56} height={56} radius={Radius.medium} />
          <View style={styles.profileText}>
            <Skeleton width={104} height={12} />
            <Skeleton width="72%" height={20} />
            <Skeleton width="86%" height={14} />
          </View>
          <Skeleton width={18} height={18} radius={Radius.small} />
        </View>
      </SkeletonCard>
      <SettingsGroupSkeleton rows={4} />
      <SettingsGroupSkeleton rows={2} />
    </View>
  );
}

export function NotificationSkeleton() {
  return (
    <SkeletonCard accessibilityLabel="Loading notification" style={styles.notificationCard}>
      <View style={styles.notificationRow}>
        <Skeleton width={8} height={8} radius={Radius.pill} style={styles.notificationDot} />
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Skeleton width="58%" height={14} />
            <Skeleton width={64} height={10} />
          </View>
          <SkeletonText lines={2} />
          <Skeleton width={86} height={20} radius={Radius.small} />
        </View>
      </View>
    </SkeletonCard>
  );
}

export function MembershipSkeleton() {
  return (
    <SkeletonCard accessibilityLabel="Loading Burger Club membership">
      <View style={styles.metaRow}>
        <SkeletonCircle size={24} />
        <Skeleton width={112} height={22} radius={Radius.pill} />
      </View>
      <Skeleton width="56%" height={14} />
    </SkeletonCard>
  );
}

export function ScheduleSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <View
      accessibilityLabel="Loading schedule"
      accessibilityState={{ busy: true }}
      style={styles.schedule}
    >
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={styles.scheduleRow}>
          <Skeleton width={82} height={14} />
          <View style={styles.scheduleHours}>
            <Skeleton width="80%" height={14} />
            {index === 0 && <Skeleton width="54%" height={12} />}
          </View>
        </View>
      ))}
    </View>
  );
}

function SettingsGroupSkeleton({ rows }: { rows: number }) {
  const theme = useTheme();

  return (
    <SkeletonCard noPadding accessibilityLabel="Loading settings">
      {Array.from({ length: rows }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.settingsRow,
            index < rows - 1 && { borderBottomColor: theme.border, borderBottomWidth: 1 },
          ]}
        >
          <SkeletonCircle size={34} />
          <View style={styles.profileText}>
            <Skeleton width="64%" height={14} />
            {index % 2 === 0 && <Skeleton width="48%" height={12} />}
          </View>
          <Skeleton width={18} height={18} radius={Radius.small} />
        </View>
      ))}
    </SkeletonCard>
  );
}

export const SkeletonBlock = Skeleton;

const styles = StyleSheet.create({
  block: {
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  card: {
    borderRadius: Radius.large,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
    gap: Spacing.two,
    overflow: 'hidden',
  },
  cardNoPadding: {
    padding: 0,
    gap: 0,
  },
  skeletonTopGap: {
    marginTop: Spacing.two,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
  },
  locationTextGroup: {
    flex: 1,
    gap: 5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  locationTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  locationDividerCover: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 0,
  },
  specialCard: {
    width: 214,
    overflow: 'hidden',
  },
  specialFeatureCard: {
    width: 272,
  },
  specialBody: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  specialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  screenGroup: {
    gap: Spacing.three,
  },
  profileIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    backgroundColor: Brand.mutedSurface,
  },
  profileText: {
    flex: 1,
    gap: 5,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  notificationCard: {
    padding: Spacing.three,
  },
  notificationRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  notificationDot: {
    marginTop: 6,
  },
  notificationContent: {
    flex: 1,
    gap: Spacing.one,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  schedule: {
    gap: Spacing.one,
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  scheduleHours: {
    flex: 1,
    gap: Spacing.one,
  },
});

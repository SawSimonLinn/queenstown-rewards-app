import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { OrganicEdge } from '@/components/ui/organic-edge';
import { Brand, IconSize, Radius, Spacing } from '@/constants/theme';

export type FoodImagePlaceholderProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  height?: DimensionValue;
  width?: DimensionValue;
  radius?: number;
  label?: string;
  size?: 'small' | 'large';
  /** Warm (primary-led) or golden (secondary-led) — the same graphic in the app's two brand hues, for variety without new colours. */
  tone?: 'warm' | 'golden';
  style?: StyleProp<ViewStyle>;
};

/**
 * Brand media area shown until real, authorised photography is supplied.
 * Deliberately an illustrated graphic — a small emblem badge over a warm
 * colour field with the app's one recurring hill-silhouette motif along the
 * base — rather than an attempt to fake food photography. Never labelled as
 * an actual photograph.
 */
export function FoodImagePlaceholder({
  icon = 'fast-food-outline',
  height = 200,
  width = '100%',
  radius = Radius.large,
  label,
  size = 'large',
  tone = 'warm',
  style,
}: FoodImagePlaceholderProps) {
  const leadColor = tone === 'warm' ? Brand.primary : Brand.secondary;
  const gradientColors: [string, string] =
    tone === 'warm' ? [Brand.primary, Brand.primaryDark] : [Brand.secondary, Brand.secondaryDark];

  return (
    <View
      style={[styles.container, { height, width, borderRadius: radius }, style]}
      accessibilityLabel={label ?? 'Image not yet available'}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.cornerBlock} />
      <View style={styles.emblemRing}>
        <View style={styles.emblemInner}>
          <Ionicons
            name={icon}
            size={size === 'large' ? IconSize.hero : IconSize.xlarge}
            color={leadColor}
          />
        </View>
      </View>
      <View style={styles.edgeWrap}>
        <OrganicEdge color={Brand.cream} height={size === 'large' ? 30 : 20} />
      </View>
      {label && (
        <View style={styles.caption}>
          <ThemedText type="eyebrow" style={styles.label} numberOfLines={1}>
            {label}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cornerBlock: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 84,
    height: 84,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    transform: [{ rotate: '18deg' }],
  },
  emblemRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Brand.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  edgeWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1,
  },
  caption: {
    position: 'absolute',
    left: Spacing.three,
    bottom: Spacing.two,
    minHeight: 26,
    borderRadius: Radius.small,
    backgroundColor: `${Brand.onPrimary}E6`,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  label: {
    color: Brand.primaryDark,
  },
});

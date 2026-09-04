import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, type BrandPalette } from '@/constants/theme';
import { useBrand } from '@/hooks/use-brand';

export type StatusTone = 'success' | 'primary' | 'warning' | 'danger' | 'neutral';

export type StatusBadgeProps = {
  label: string;
  tone: StatusTone;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Solid dark pill with white text/icon, instead of the default tone-tinted pill. */
  solid?: boolean;
};

/** Resolves each status tone to a color from the active brand palette — pass `useBrand()`'s result so `primary` follows the signed-in role. */
export function getToneColor(brand: BrandPalette): Record<StatusTone, string> {
  return {
    success: brand.success,
    primary: brand.primary,
    warning: brand.warning,
    danger: brand.danger,
    neutral: brand.charcoal,
  };
}

const TONE_ICON: Record<StatusTone, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  primary: 'information-circle',
  warning: 'time',
  danger: 'close-circle',
  neutral: 'ellipse',
};

/**
 * A single reusable status badge. Never relies on color alone — every tone
 * pairs with a distinct icon and label so status reads correctly even
 * without color perception.
 */
export function StatusBadge({ label, tone, icon, solid = false }: StatusBadgeProps) {
  const brand = useBrand();
  const color = getToneColor(brand)[tone];
  const contentColor = solid ? brand.onPrimary : color;

  return (
    <View
      style={[
        styles.badge,
        solid
          ? { backgroundColor: brand.charcoal, borderColor: brand.charcoal }
          : { backgroundColor: `${color}1F`, borderColor: `${color}55` },
      ]}
      accessibilityLabel={label}
    >
      <Ionicons name={icon ?? TONE_ICON[tone]} size={13} color={contentColor} />
      <ThemedText type="smallBold" style={{ color: contentColor }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
});

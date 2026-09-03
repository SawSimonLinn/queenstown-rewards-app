import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Radius, Spacing } from '@/constants/theme';

export type StatusTone = 'success' | 'primary' | 'warning' | 'danger' | 'neutral';

export type StatusBadgeProps = {
  label: string;
  tone: StatusTone;
  icon?: keyof typeof Ionicons.glyphMap;
};

const TONE_COLOR: Record<StatusTone, string> = {
  success: Brand.success,
  primary: Brand.primary,
  warning: Brand.warning,
  danger: Brand.danger,
  neutral: Brand.charcoal,
};

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
export function StatusBadge({ label, tone, icon }: StatusBadgeProps) {
  const color = TONE_COLOR[tone];

  return (
    <View
      style={[styles.badge, { backgroundColor: `${color}1F`, borderColor: `${color}55` }]}
      accessibilityLabel={label}
    >
      <Ionicons name={icon ?? TONE_ICON[tone]} size={13} color={color} />
      <ThemedText type="smallBold" style={{ color }}>
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

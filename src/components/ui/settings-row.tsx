import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, IconSize, Radius, Spacing } from '@/constants/theme';
import { useBrand } from '@/hooks/use-brand';

export type SettingsRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
};

/** A single tappable row inside a `Card noPadding` group — Profile and Account Settings share this. */
export function SettingsRow({ icon, label, value, onPress }: SettingsRowProps) {
  const brand = useBrand();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${brand.primary}14` }]}>
        <Ionicons name={icon} size={IconSize.medium} color={brand.primary} />
      </View>
      <View style={styles.textGroup}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        {value && (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {value}
          </ThemedText>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={brand.primary} />
    </Pressable>
  );
}

export function SettingsRowDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    minHeight: 64,
  },
  rowPressed: {
    backgroundColor: Brand.mutedSurface,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: Brand.charcoal,
  },
  divider: {
    height: 1,
    marginLeft: Spacing.three + 36 + Spacing.three,
    backgroundColor: `${Brand.charcoal}12`,
  },
});

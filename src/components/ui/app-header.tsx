import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconButton } from '@/components/ui/icon-button';
import { Radius, Spacing } from '@/constants/theme';
import { useBrand } from '@/hooks/use-brand';
import { useTheme } from '@/hooks/use-theme';

export type AppHeaderProps = {
  /** Small line above the title, e.g. a greeting or eyebrow label. */
  eyebrow?: string;
  title: string;
  onBackPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  rightAccessibilityLabel?: string;
  /** Shows a numeric badge on the right icon, e.g. an unread count. Hidden when 0/undefined; shows "9+" above 9. */
  rightBadgeCount?: number;
};

export function AppHeader({
  eyebrow,
  title,
  onBackPress,
  rightIcon,
  onRightPress,
  rightAccessibilityLabel,
  rightBadgeCount,
}: AppHeaderProps) {
  const theme = useTheme();
  const brand = useBrand();

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {onBackPress && (
          <IconButton
            name="chevron-back"
            accessibilityLabel="Go back"
            onPress={onBackPress}
            variant="filled"
          />
        )}
        {!onBackPress && (
          <View
            style={[styles.brandMark, { backgroundColor: brand.primary }]}
            accessibilityElementsHidden
          >
            <ThemedText type="editorial" style={[styles.brandMarkText, { color: brand.onPrimary }]}>
              Q
            </ThemedText>
          </View>
        )}
        <View style={styles.titleGroup}>
          {eyebrow && (
            <ThemedText type="eyebrow" numberOfLines={1}>
              {eyebrow}
            </ThemedText>
          )}
          <ThemedText type="title" numberOfLines={1}>
            {title}
          </ThemedText>
        </View>
      </View>
      {rightIcon && (
        <View>
          <IconButton
            name={rightIcon}
            accessibilityLabel={rightAccessibilityLabel ?? 'Action'}
            onPress={onRightPress}
            variant="filled"
          />
          {!!rightBadgeCount && rightBadgeCount > 0 && (
            <View
              style={[
                styles.badgeCount,
                { backgroundColor: brand.primary, borderColor: theme.background },
              ]}
              accessibilityElementsHidden
            >
              <ThemedText
                type="small"
                style={[styles.badgeCountText, { color: brand.onPrimary }]}
              >
                {rightBadgeCount > 9 ? '9+' : rightBadgeCount}
              </ThemedText>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    minHeight: 44,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: Radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    fontSize: 22,
    lineHeight: 26,
  },
  titleGroup: {
    flex: 1,
    gap: 2,
  },
  badgeCount: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCountText: {
    fontSize: 10,
    lineHeight: 12,
  },
});

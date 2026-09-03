import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconButton } from '@/components/ui/icon-button';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type AppHeaderProps = {
  /** Small line above the title, e.g. a greeting or eyebrow label. */
  eyebrow?: string;
  title: string;
  onBackPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  rightAccessibilityLabel?: string;
  /** Shows a small dot on the right icon, e.g. unread notifications. */
  rightBadge?: boolean;
};

export function AppHeader({
  eyebrow,
  title,
  onBackPress,
  rightIcon,
  onRightPress,
  rightAccessibilityLabel,
  rightBadge,
}: AppHeaderProps) {
  const theme = useTheme();

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
          <View style={styles.brandMark} accessibilityElementsHidden>
            <ThemedText type="smallBold" style={styles.brandMarkText}>
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
          {rightBadge && (
            <View
              style={[styles.badgeDot, { borderColor: theme.background }]}
              accessibilityElementsHidden
            />
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
    width: 36,
    height: 36,
    borderRadius: Radius.small,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: Brand.onPrimary,
    fontSize: 18,
  },
  titleGroup: {
    flex: 1,
    gap: 2,
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Brand.primary,
    borderWidth: 2,
  },
});

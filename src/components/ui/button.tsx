import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, MinTouchTarget, Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'default' | 'large';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
  accessibilityLabel?: string;
  fullWidth?: boolean;
};

export function Button({
  label,
  variant = 'primary',
  size = 'default',
  loading = false,
  loadingLabel,
  disabled,
  accessibilityLabel,
  fullWidth = true,
  ...pressableProps
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const textColor =
    variant === 'primary'
      ? Brand.onPrimary
      : variant === 'secondary'
        ? Brand.onSecondary
        : variant === 'outline'
          ? Brand.primaryDark
          : Brand.primary;
  const spinnerColor = variant === 'primary' ? Brand.onPrimary : Brand.primary;
  const visibleLabel = loading && loadingLabel ? loadingLabel : label;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? visibleLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'large' && styles.large,
        !fullWidth && styles.inline,
        variant === 'primary' && [styles.raised, { backgroundColor: Brand.primary }],
        variant === 'secondary' && { backgroundColor: Brand.secondary },
        variant === 'outline' && {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: Brand.primary,
        },
        variant === 'ghost' && {
          backgroundColor: theme.surfaceSunken,
        },
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
      {...pressableProps}
    >
      <View style={styles.content}>
        <View style={styles.spinnerSlot}>
          {loading && <ActivityIndicator size="small" color={spinnerColor} />}
        </View>
        <ThemedText type="smallBold" style={{ color: textColor }} numberOfLines={1}>
          {visibleLabel}
        </ThemedText>
        <View style={styles.spinnerSlot} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MinTouchTarget,
    borderRadius: Radius.medium,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  large: {
    minHeight: 56,
    borderRadius: Radius.large,
  },
  inline: {
    alignSelf: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    maxWidth: '100%',
  },
  spinnerSlot: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  raised: {
    ...Shadows.card,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.45,
  },
});

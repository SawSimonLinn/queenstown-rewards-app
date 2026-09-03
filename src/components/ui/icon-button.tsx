import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { IconSize, MinTouchTarget, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type IconButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  name: keyof typeof Ionicons.glyphMap;
  accessibilityLabel: string;
  color?: string;
  size?: number;
  variant?: 'plain' | 'filled';
};

export function IconButton({
  name,
  accessibilityLabel,
  color,
  size = IconSize.large,
  variant = 'plain',
  ...pressableProps
}: IconButtonProps) {
  const theme = useTheme();
  const iconColor = color ?? theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        variant === 'filled' && { backgroundColor: theme.backgroundElement },
        pressed && styles.pressed,
      ]}
      {...pressableProps}
    >
      <Ionicons name={name} size={size} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minWidth: MinTouchTarget,
    minHeight: MinTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  pressed: {
    opacity: 0.6,
  },
});

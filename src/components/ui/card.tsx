import { Pressable, StyleSheet, type ViewProps } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type CardProps = ViewProps & {
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Removes the default padding — useful when a child (e.g. an image) needs to bleed to the edges. */
  noPadding?: boolean;
  elevated?: boolean;
};

export function Card({
  style,
  onPress,
  accessibilityLabel,
  noPadding,
  elevated = false,
  children,
  ...rest
}: CardProps) {
  const theme = useTheme();
  const cardStyle = [
    styles.card,
    { borderColor: theme.border },
    elevated && Shadows.card,
    noPadding && styles.noPadding,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        <ThemedView type="backgroundElement" style={cardStyle} {...rest}>
          {children}
        </ThemedView>
      </Pressable>
    );
  }

  return (
    <ThemedView type="backgroundElement" style={cardStyle} {...rest}>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.large,
    padding: Spacing.three,
    gap: Spacing.two,
    borderWidth: 1,
  },
  noPadding: {
    padding: 0,
    gap: 0,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.995 }],
  },
});

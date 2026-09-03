import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IconSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ChooseLocationPromptCardProps = {
  onChooseLocation: () => void;
  onDismiss: () => void;
};

/**
 * Optional, dismissible nudge shown on Home when the signed-in user has no
 * preferred location yet — never a full-screen blocker. Choosing a location
 * always happens elsewhere (the star on a location card, Location Details,
 * or Account Settings), so "Choose location" here just points the way.
 */
export function ChooseLocationPromptCard({
  onChooseLocation,
  onDismiss,
}: ChooseLocationPromptCardProps) {
  const theme = useTheme();
  return (
    <Card accessibilityLabel="Choose your favourite location">
      <View style={styles.headerRow}>
        <ThemedText type="smallBold" style={styles.title}>
          Choose your favourite location
        </ThemedText>
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          hitSlop={8}
        >
          <Ionicons name="close" size={IconSize.medium} color={theme.textMuted} />
        </Pressable>
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        Get more relevant specials and location updates.
      </ThemedText>
      <View style={styles.actions}>
        <Button
          label="Choose location"
          onPress={onChooseLocation}
          size="default"
          fullWidth={false}
        />
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Not now"
          hitSlop={8}
          style={styles.notNow}
        >
          <ThemedText type="linkPrimary">Not now</ThemedText>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    marginTop: Spacing.one,
  },
  notNow: {
    paddingVertical: Spacing.two,
  },
});

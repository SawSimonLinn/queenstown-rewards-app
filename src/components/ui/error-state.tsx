import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Brand, Spacing } from '@/constants/theme';

export type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ title = "Something didn't load", message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container} accessibilityLabel={title}>
      <View style={styles.iconWrap}>
        <Ionicons name="cloud-offline-outline" size={26} color={Brand.danger} />
      </View>
      <ThemedText type="smallBold" style={styles.center}>
        {title}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
        {message}
      </ThemedText>
      {onRetry && (
        <Button label="Try again" variant="outline" onPress={onRetry} fullWidth={false} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Brand.danger}1A`,
    marginBottom: Spacing.one,
  },
  center: {
    textAlign: 'center',
  },
});

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Brand, Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type JoinClubSheetProps = {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => Promise<void>;
  onViewTermsPress: () => void;
};

export function JoinClubSheet({
  visible,
  onDismiss,
  onConfirm,
  onViewTermsPress,
}: JoinClubSheetProps) {
  const theme = useTheme();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDismiss = () => {
    if (submitting) return;
    setError(null);
    onDismiss();
  };

  const handleConfirm = async () => {
    if (!agreed || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
      setAgreed(false);
    } catch {
      setError("Couldn't join right now — try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
      statusBarTranslucent
    >
      <Pressable
        style={styles.backdrop}
        onPress={handleDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss dialog"
      >
        <Pressable
          style={[styles.sheet, Shadows.raised, { backgroundColor: theme.backgroundElement }]}
          onPress={(event) => event.stopPropagation()}
          accessibilityViewIsModal
        >
          <ThemedText type="subtitle">Join the Club</ThemedText>
          <ThemedText themeColor="textSecondary">
            Get a complimentary Burger of the Month, every month, free to join — cancel anytime.
          </ThemedText>

          <ThemedText type="linkPrimary" onPress={onViewTermsPress} accessibilityRole="link">
            View Burger Club terms
          </ThemedText>

          <Pressable
            onPress={() => setAgreed((value) => !value)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreed }}
            accessibilityLabel="I agree to the Burger of the Month Club Terms"
            style={styles.checkboxRow}
          >
            <Ionicons
              name={agreed ? 'checkbox' : 'square-outline'}
              size={22}
              color={agreed ? Brand.primary : theme.text}
            />
            <ThemedText style={styles.checkboxLabel}>
              I agree to the Burger of the Month Club Terms
            </ThemedText>
          </Pressable>

          {error && (
            <ThemedText type="small" style={{ color: Brand.danger }}>
              {error}
            </ThemedText>
          )}

          <View style={styles.actions}>
            <Button
              label="Cancel"
              variant="outline"
              onPress={handleDismiss}
              disabled={submitting}
            />
            <Button
              label="Confirm and Join"
              onPress={handleConfirm}
              disabled={!agreed}
              loading={submitting}
              loadingLabel="Joining"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,14,10,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  sheet: {
    width: '100%',
    maxWidth: 400,
    borderRadius: Radius.xlarge,
    padding: Spacing.five,
    gap: Spacing.three,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 44,
  },
  checkboxLabel: {
    flex: 1,
  },
  actions: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
});

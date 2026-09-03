import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FadeInView } from '@/components/ui/motion';
import { Brand, IconSize, Radius, Spacing } from '@/constants/theme';

export type InlineFeedbackTone = 'error' | 'success' | 'warning';

const TONE_STYLES: Record<
  InlineFeedbackTone,
  { icon: keyof typeof Ionicons.glyphMap; foreground: string; background: string; border: string }
> = {
  error: {
    icon: 'alert-circle-outline',
    foreground: Brand.danger,
    background: `${Brand.danger}12`,
    border: `${Brand.danger}33`,
  },
  success: {
    icon: 'checkmark-circle-outline',
    foreground: Brand.success,
    background: `${Brand.success}12`,
    border: `${Brand.success}33`,
  },
  warning: {
    icon: 'warning-outline',
    foreground: Brand.warning,
    background: `${Brand.warning}12`,
    border: `${Brand.warning}33`,
  },
};

export function InlineFeedback({
  message,
  tone = 'error',
}: {
  message: string;
  tone?: InlineFeedbackTone;
}) {
  const toneStyle = TONE_STYLES[tone];

  return (
    <FadeInView
      style={[
        styles.container,
        { backgroundColor: toneStyle.background, borderColor: toneStyle.border },
      ]}
      accessibilityRole="alert"
    >
      <Ionicons name={toneStyle.icon} size={IconSize.small} color={toneStyle.foreground} />
      <ThemedText type="small" style={[styles.message, { color: toneStyle.foreground }]}>
        {message}
      </ThemedText>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 40,
    borderRadius: Radius.medium,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  message: {
    flex: 1,
  },
});

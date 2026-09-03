import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { LinkHitSlop } from '@/constants/theme';

export type SectionHeaderProps = {
  title: string;
  /** Small editorial label above the title, e.g. a section kicker. */
  eyebrow?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function SectionHeader({ title, eyebrow, actionLabel, onActionPress }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.titleGroup}>
        {eyebrow && <ThemedText type="eyebrow">{eyebrow}</ThemedText>}
        <ThemedText type="subtitle">{title}</ThemedText>
      </View>
      {actionLabel && onActionPress && (
        <Pressable
          onPress={onActionPress}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={LinkHitSlop}
        >
          <ThemedText type="linkPrimary">{actionLabel}</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleGroup: {
    flex: 1,
    gap: 2,
  },
});

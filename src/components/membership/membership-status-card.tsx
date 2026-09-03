import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Brand, IconSize, Spacing } from '@/constants/theme';
import { formatDate } from '@/lib/format';
import type { ClubMembership } from '@/types';

export type MembershipStatusCardProps = {
  membership: ClubMembership;
};

export function MembershipStatusCard({ membership }: MembershipStatusCardProps) {
  return (
    <Card accessibilityLabel="Club Member">
      <View style={styles.row}>
        <Ionicons name="ribbon" size={IconSize.medium} color={Brand.primary} />
        <StatusBadge label="Club Member" tone="success" />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        Member since {formatDate(membership.joinedAt)}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brand, IconSize, Spacing } from '@/constants/theme';
import type { BurgerCampaign } from '@/types';

const BENEFITS = [
  'A complimentary burger every month',
  'First access to the featured monthly burger',
  'No cost to join',
];

export type JoinClubCardProps = {
  campaign: BurgerCampaign | null;
  onJoinPress: () => void;
  onViewTermsPress: () => void;
};

export function JoinClubCard({ campaign, onJoinPress, onViewTermsPress }: JoinClubCardProps) {
  return (
    <Card accessibilityLabel="Join the Burger of the Month Club">
      <View style={styles.headerRow}>
        <Ionicons name="ribbon" size={IconSize.medium} color={Brand.primary} />
        <ThemedText type="smallBold">Burger of the Month Club</ThemedText>
      </View>

      {campaign && (
        <ThemedText themeColor="textSecondary">
          This month: <ThemedText type="smallBold">{campaign.name}</ThemedText>
        </ThemedText>
      )}

      <View style={styles.benefits}>
        {BENEFITS.map((benefit) => (
          <View key={benefit} style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={16} color={Brand.success} />
            <ThemedText type="small" style={styles.benefitText}>
              {benefit}
            </ThemedText>
          </View>
        ))}
      </View>

      <ThemedText type="linkPrimary" onPress={onViewTermsPress} accessibilityRole="link">
        View Burger Club terms
      </ThemedText>

      <Button label="Join the Club" onPress={onJoinPress} size="large" />
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  benefits: {
    gap: Spacing.one,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  benefitText: {
    flex: 1,
  },
});

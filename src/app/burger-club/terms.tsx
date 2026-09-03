import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Brand, Spacing } from '@/constants/theme';

const TERMS: string[] = [
  'Club membership is required to participate in the Burger of the Month Club.',
  'Members agree to receive Burger Club and promotional email updates.',
  'The complimentary offer applies to the designated Burger of the Month only.',
  'Purchase of another qualifying entrée is required to redeem the complimentary burger.',
  'One monthly reward is available per eligible member, unless Queenstown specifies otherwise.',
  'The offer is subject to participating locations and availability.',
  'The reward cannot be redeemed for cash.',
  'The reward cannot be duplicated or transferred.',
  'The reward must be redeemed before its displayed expiration date.',
  'The QR code must be validated at a participating restaurant.',
  'Staff confirmation is required to complete redemption.',
  'Screenshots or copied codes do not count as a valid redemption.',
  'Restaurant-specific exclusions may apply.',
  'Ask your server for current details at the time of redemption.',
  'Terms may change and must ultimately be confirmed by Queenstown management.',
];

export default function ClubTermsScreen() {
  return (
    <ScreenContainer scroll>
      <View style={styles.iconWrap}>
        <Ionicons name="document-text" size={28} color={Brand.primary} />
      </View>
      <ThemedText type="title" style={styles.center}>
        Burger Club terms
      </ThemedText>

      <Card accessibilityLabel="Preview notice">
        <View style={styles.noticeRow}>
          <Ionicons name="information-circle" size={16} color={Brand.warning} />
          <ThemedText type="small" style={{ color: Brand.warning, flex: 1 }}>
            Preview terms for product design. Final terms require Queenstown approval.
          </ThemedText>
        </View>
      </Card>

      <View style={styles.list}>
        {TERMS.map((term) => (
          <View key={term} style={styles.termRow}>
            <View style={styles.bullet} />
            <ThemedText themeColor="textSecondary" style={styles.termText}>
              {term}
            </ThemedText>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Brand.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: Spacing.three,
  },
  center: {
    textAlign: 'center',
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  list: {
    gap: Spacing.two,
  },
  termRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Brand.primary,
    marginTop: 8,
  },
  termText: {
    flex: 1,
  },
});

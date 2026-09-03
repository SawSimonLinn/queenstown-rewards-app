import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SectionHeader } from '@/components/ui/section-header';
import { APP_NAME } from '@/constants/app';
import { Brand, Spacing } from '@/constants/theme';

const LAST_UPDATED = 'September 2026';

type Section = { title: string; items: string[] };

const SECTIONS: Section[] = [
  {
    title: 'Using the app',
    items: [
      `${APP_NAME} is provided for personal use by account holders aged 16 and over.`,
      'You are responsible for keeping your account credentials secure and for activity that happens under your account.',
      'You agree to provide accurate information when registering and to keep it up to date.',
    ],
  },
  {
    title: 'Rewards and redemption',
    items: [
      'Rewards, including Burger of the Month Club offers, are subject to availability at participating locations and may change or be withdrawn at any time.',
      'Redemption limits (for example, one Burger of the Month redemption per member per calendar month) are enforced and cannot be bypassed or combined across periods.',
      'A reward is redeemed only once a staff member confirms it in person — displaying or scanning a QR code alone does not complete a redemption.',
      'Rewards cannot be exchanged for cash, duplicated, transferred to another person, or redeemed after their displayed expiration date.',
      'We reserve the right to refuse or reverse a redemption we reasonably believe is fraudulent or made in error.',
    ],
  },
  {
    title: 'Account suspension',
    items: [
      'We may suspend or terminate an account that misuses rewards, violates these terms, or attempts to defraud a participating location.',
    ],
  },
  {
    title: 'Changes to the service',
    items: [
      'We may add, change, or remove features, specials, and participating locations at any time.',
      'These terms may be updated from time to time; continued use of the app after an update means you accept the revised terms.',
    ],
  },
  {
    title: 'Liability',
    items: [
      `${APP_NAME} is provided "as is." We aren't liable for losses arising from app downtime, inaccurate special or location information, or a participating location's inability to honor a reward.`,
    ],
  },
];

export default function TermsAndConditionsScreen() {
  const router = useRouter();

  return (
    <ScreenContainer scroll>
      <View style={styles.iconWrap}>
        <Ionicons name="document-text" size={28} color={Brand.primary} />
      </View>
      <ThemedText type="title" style={styles.center}>
        Terms and conditions
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.center}>
        Last updated {LAST_UPDATED}
      </ThemedText>

      <Card accessibilityLabel="Preview notice">
        <View style={styles.noticeRow}>
          <Ionicons name="information-circle" size={16} color={Brand.warning} />
          <ThemedText type="small" style={{ color: Brand.warning, flex: 1 }}>
            Preview terms for product design. Final terms require Queenstown management approval
            before launch.
          </ThemedText>
        </View>
      </Card>

      {SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <SectionHeader title={section.title} />
          <View style={styles.list}>
            {section.items.map((term) => (
              <View key={term} style={styles.termRow}>
                <View style={styles.bullet} />
                <ThemedText themeColor="textSecondary" style={styles.termText}>
                  {term}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      ))}

      <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
        Burger of the Month Club membership has its own additional terms.
      </ThemedText>
      <ThemedText
        type="linkPrimary"
        style={styles.center}
        onPress={() => router.push('/burger-club/terms')}
        accessibilityRole="link"
      >
        View Burger Club terms
      </ThemedText>
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
  section: {
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

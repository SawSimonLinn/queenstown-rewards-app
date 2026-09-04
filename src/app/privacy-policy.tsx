import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SectionHeader } from '@/components/ui/section-header';
import { APP_NAME } from '@/constants/app';
import { Brand, Spacing } from '@/constants/theme';
import { useBrand } from '@/hooks/use-brand';

const LAST_UPDATED = 'September 2026';
const SUPPORT_EMAIL = 'privacy@queenstownrewards.co.nz';

type Section = { title: string; paragraphs: string[] };

const SECTIONS: Section[] = [
  {
    title: 'What we collect',
    paragraphs: [
      'Account details you provide when you register, such as your name and email address.',
      'Membership and redemption activity, including Burger of the Month Club status and reward redemption history, so we can enforce redemption limits and show you your history.',
      'Locations you view or set as a preference, so we can personalize specials and recommendations.',
      'A push notification token, if you enable notifications, so we can send you reward and specials updates.',
    ],
  },
  {
    title: 'How we use it',
    paragraphs: [
      `We use your information to operate ${APP_NAME}: authenticating your account, tracking and validating reward redemptions, preventing duplicate or fraudulent redemptions, and personalizing content such as preferred-location specials.`,
      'We do not sell your personal information to third parties.',
    ],
  },
  {
    title: 'Staff access',
    paragraphs: [
      'Staff members at participating locations can view a reward’s validity and confirm redemptions when you present a QR code. They do not have access to your full account details beyond what is needed to complete a redemption.',
    ],
  },
  {
    title: 'Data retention',
    paragraphs: [
      'We retain your account and redemption history for as long as your account is active. You can request deletion of your account and associated data at any time — see "Your choices" below.',
    ],
  },
  {
    title: 'Your choices',
    paragraphs: [
      'You can edit your profile, change your preferred location, and turn push notifications on or off at any time from Profile → Account settings.',
      'To request a copy of your data or full account deletion, contact us using the details below.',
    ],
  },
  {
    title: 'Security',
    paragraphs: [
      'Your data is stored with access controls that restrict it to your own account — other members and locations cannot see your personal information or history.',
    ],
  },
];

export default function PrivacyPolicyScreen() {
  const brand = useBrand();
  return (
    <ScreenContainer scroll>
      <View style={[styles.iconWrap, { backgroundColor: `${brand.primary}1A` }]}>
        <Ionicons name="shield-checkmark" size={28} color={brand.primary} />
      </View>
      <ThemedText type="title" style={styles.center}>
        Privacy policy
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.center}>
        Last updated {LAST_UPDATED}
      </ThemedText>

      <Card accessibilityLabel="Preview notice">
        <View style={styles.noticeRow}>
          <Ionicons name="information-circle" size={16} color={Brand.warning} />
          <ThemedText type="small" style={{ color: Brand.warning, flex: 1 }}>
            Preview policy for product design. Final policy text requires legal review before
            launch.
          </ThemedText>
        </View>
      </Card>

      {SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <SectionHeader title={section.title} />
          {section.paragraphs.map((paragraph) => (
            <ThemedText key={paragraph} themeColor="textSecondary">
              {paragraph}
            </ThemedText>
          ))}
        </View>
      ))}

      <Card accessibilityLabel="Contact us about privacy">
        <ThemedText type="smallBold">Questions about your data?</ThemedText>
        <ThemedText themeColor="textSecondary">Email {SUPPORT_EMAIL}.</ThemedText>
      </Card>
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
});

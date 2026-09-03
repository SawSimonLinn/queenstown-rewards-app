import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SectionHeader } from '@/components/ui/section-header';
import { APP_NAME } from '@/constants/app';
import { Brand, IconSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FaqItem = { id: string; question: string; answer: string };
type FaqSection = { title: string; items: FaqItem[] };

const FAQ_SECTIONS: FaqSection[] = [
  {
    title: 'Burger of the Month Club',
    items: [
      {
        id: 'club-what',
        question: 'What is the Burger of the Month Club?',
        answer:
          'Members get a complimentary featured burger every month at participating Queenstown Hospitality Group locations, alongside the purchase of another qualifying entrée.',
      },
      {
        id: 'club-join',
        question: 'How do I join?',
        answer:
          'Open the Burger of the Month card on the Home tab and follow the join steps. Membership is free and takes about a minute to set up.',
      },
      {
        id: 'club-limit',
        question: 'How many times can I redeem per month?',
        answer:
          'One complimentary Burger of the Month redemption per eligible member, per calendar month.',
      },
    ],
  },
  {
    title: 'Redeeming a reward',
    items: [
      {
        id: 'redeem-steps',
        question: 'How do I redeem my reward?',
        answer:
          'From the Rewards tab, open your active reward and show the QR code to your server at a participating location. They’ll scan it and confirm the redemption on their device.',
      },
      {
        id: 'redeem-scan-only',
        question: 'I scanned the code — why isn’t my reward marked as used?',
        answer:
          'Scanning only validates that the code is genuine. Your reward is marked used only after a staff member confirms the redemption in person — that final confirmation step is what completes it.',
      },
      {
        id: 'redeem-screenshot',
        question: 'Can I use a screenshot of my code?',
        answer:
          'No. Screenshots and copied codes aren’t accepted — the code must be displayed live from the app so staff can validate it at the counter.',
      },
      {
        id: 'redeem-locations',
        question: 'Which locations can I redeem at?',
        answer:
          'Any location marked as a Burger Club participant. Check the Locations tab to see which restaurants near you are currently participating.',
      },
    ],
  },
  {
    title: 'Account & app',
    items: [
      {
        id: 'account-notifications',
        question: 'How do I get notified about new rewards and specials?',
        answer:
          'Turn on push notifications from the Profile tab. You’ll be notified when a new Burger of the Month unlocks or a new special is posted.',
      },
      {
        id: 'account-location',
        question: 'What does setting a preferred location do?',
        answer:
          'Your preferred location is used to personalize specials, campaigns, and recommendations shown on the Home tab. Change it any time from Account settings.',
      },
      {
        id: 'account-email',
        question: 'How do I change my email or password?',
        answer:
          'Go to Profile → Account settings → Security, where you can update your email address or change your password.',
      },
      {
        id: 'account-delete',
        question: 'How do I delete my account?',
        answer:
          `Contact us using the details below and we'll process your account deletion request, including removal of your profile, redemption history, and any saved locations.`,
      },
    ],
  },
];

const SUPPORT_EMAIL = 'support@queenstownrewards.co.nz';

export default function HelpScreen() {
  const [openId, setOpenId] = useState<string | null>(null);
  const theme = useTheme();

  return (
    <ScreenContainer scroll>
      <View style={styles.iconWrap}>
        <Ionicons name="help-circle" size={28} color={Brand.primary} />
      </View>
      <ThemedText type="title" style={styles.center}>
        Help & FAQ
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.center}>
        Answers to common questions about {APP_NAME}. Still stuck? Reach out below.
      </ThemedText>

      {FAQ_SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <SectionHeader title={section.title} />
          <Card noPadding style={styles.group} accessibilityLabel={section.title}>
            {section.items.map((item, index) => {
              const isOpen = openId === item.id;
              return (
                <View key={item.id}>
                  {index > 0 && (
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                  )}
                  <Pressable
                    onPress={() => setOpenId(isOpen ? null : item.id)}
                    accessibilityRole="button"
                    accessibilityLabel={item.question}
                    accessibilityState={{ expanded: isOpen }}
                    style={styles.faqRow}
                  >
                    <ThemedText type="smallBold" style={styles.faqQuestion}>
                      {item.question}
                    </ThemedText>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={IconSize.small}
                      color={Brand.primary}
                    />
                  </Pressable>
                  {isOpen && (
                    <ThemedText themeColor="textSecondary" style={styles.faqAnswer}>
                      {item.answer}
                    </ThemedText>
                  )}
                </View>
              );
            })}
          </Card>
        </View>
      ))}

      <Card accessibilityLabel="Contact support">
        <View style={styles.contactRow}>
          <Ionicons name="mail-outline" size={18} color={Brand.primary} />
          <ThemedText type="smallBold">Still need help?</ThemedText>
        </View>
        <ThemedText themeColor="textSecondary">
          Email us and we’ll get back to you, or ask a staff member next time you visit a
          participating location.
        </ThemedText>
        <Pressable
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          accessibilityRole="link"
          accessibilityLabel={`Email ${SUPPORT_EMAIL}`}
        >
          <ThemedText type="linkPrimary">{SUPPORT_EMAIL}</ThemedText>
        </Pressable>
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
  section: {
    gap: Spacing.two,
  },
  group: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  faqQuestion: {
    flex: 1,
  },
  faqAnswer: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Brand, Spacing } from '@/constants/theme';
import { useBrand } from '@/hooks/use-brand';

const STEPS: { title: string; detail: string }[] = [
  { title: 'Join the Club', detail: 'Join once — it takes a minute.' },
  {
    title: 'Receive access to the featured monthly burger',
    detail: 'A new complimentary burger unlocks in the app every month.',
  },
  {
    title: 'Visit a participating restaurant',
    detail: 'Any Queenstown Hospitality Group location marked as a Burger Club participant.',
  },
  {
    title: 'Purchase another qualifying entrée',
    detail: 'The complimentary burger comes alongside another qualifying menu item.',
  },
  {
    title: 'Open your reward and scan the QR code',
    detail: 'Scan the code displayed at the restaurant — not a screenshot or a copied code.',
  },
  {
    title: 'Show the validated reward to your server',
    detail: 'A green checkmark means the code is valid — that alone does not redeem it yet.',
  },
  {
    title: 'Allow staff to confirm the redemption',
    detail: 'Your reward is used only once a staff member confirms it on their device.',
  },
  {
    title: 'Enjoy your complimentary Burger of the Month',
    detail: '',
  },
];

export default function HowItWorksScreen() {
  const router = useRouter();
  const brand = useBrand();

  return (
    <ScreenContainer scroll>
      <View style={[styles.iconWrap, { backgroundColor: `${brand.primary}1A` }]}>
        <Ionicons name="ribbon" size={32} color={brand.primary} />
      </View>
      <ThemedText type="title" style={styles.center}>
        How the Burger Club works
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.center}>
        Eight simple steps from joining to enjoying your complimentary burger.
      </ThemedText>

      <View style={styles.stepList}>
        {STEPS.map((step, index) => (
          <Card key={step.title} accessibilityLabel={`Step ${index + 1}: ${step.title}`}>
            <View style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: brand.primary }]}>
                <ThemedText type="smallBold" style={styles.stepNumberText}>
                  {index + 1}
                </ThemedText>
              </View>
              <View style={styles.stepTextGroup}>
                <ThemedText type="smallBold">{step.title}</ThemedText>
                {step.detail ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    {step.detail}
                  </ThemedText>
                ) : null}
              </View>
            </View>
          </Card>
        ))}
      </View>

      <Card accessibilityLabel="Important reminder">
        <View style={styles.reminderRow}>
          <Ionicons name="alert-circle" size={18} color={Brand.warning} />
          <ThemedText type="smallBold" style={{ color: Brand.warning }}>
            Scanning alone doesn&apos;t redeem your reward
          </ThemedText>
        </View>
        <ThemedText themeColor="textSecondary">
          Validating the QR code only confirms it&apos;s genuine. Your reward is marked used only
          after a staff member confirms it in person.
        </ThemedText>
      </Card>

      <Button label="Back to Home" variant="outline" onPress={() => router.back()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Brand.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: Spacing.three,
  },
  center: {
    textAlign: 'center',
  },
  stepList: {
    gap: Spacing.three,
  },
  stepRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: Brand.onPrimary,
  },
  stepTextGroup: {
    flex: 1,
    gap: 2,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Brand, IconSize, Spacing } from '@/constants/theme';
import { usePreferredLocation } from '@/lib/preferred-location';

export default function RedemptionConfirmScreen() {
  const router = useRouter();
  const { preferredLocation } = usePreferredLocation();
  const [acknowledged, setAcknowledged] = useState(false);

  if (!preferredLocation) {
    return (
      <ScreenContainer>
        <Card accessibilityLabel="Choose a location first">
          <View style={styles.iconWrap}>
            <Ionicons name="location-outline" size={IconSize.xlarge} color={Brand.primary} />
          </View>
          <ThemedText type="smallBold">Choose a location first</ThemedText>
          <ThemedText themeColor="textSecondary">
            Select the Queenstown restaurant you&apos;re redeeming at before continuing.
          </ThemedText>
          <Button label="Go to Locations" onPress={() => router.push('/(tabs)/locations')} />
        </Card>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <ThemedText type="title">Before you redeem</ThemedText>

      <Card accessibilityLabel={`Redeeming at ${preferredLocation.name}`}>
        <View style={styles.rowHeader}>
          <Ionicons name="storefront" size={IconSize.medium} color={Brand.primary} />
          <ThemedText type="smallBold">Redeeming at</ThemedText>
        </View>
        <ThemedText themeColor="textSecondary">
          {preferredLocation.name} · {preferredLocation.neighbourhood}
        </ThemedText>
      </Card>

      <Card accessibilityLabel="Purchase requirement">
        <View style={styles.rowHeader}>
          <Ionicons name="restaurant" size={IconSize.medium} color={Brand.primary} />
          <ThemedText type="smallBold">Purchase a qualifying entrée</ThemedText>
        </View>
        <ThemedText themeColor="textSecondary">
          Ask your server if you&apos;re not sure what qualifies.
        </ThemedText>
      </Card>

      <Card accessibilityLabel="Wait for staff before scanning">
        <View style={styles.rowHeader}>
          <Ionicons name="hand-left" size={IconSize.medium} color={Brand.warning} />
          <ThemedText type="smallBold" style={{ color: Brand.warning }}>
            Don&apos;t scan yet
          </ThemedText>
        </View>
        <ThemedText themeColor="textSecondary">
          Wait for your server to ask. Scanning alone doesn&apos;t confirm your redemption — staff
          must do that.
        </ThemedText>
      </Card>

      <Pressable
        onPress={() => setAcknowledged((value) => !value)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: acknowledged }}
        accessibilityLabel="I acknowledge the Burger Club terms"
        style={styles.checkboxRow}
      >
        <Ionicons
          name={acknowledged ? 'checkbox' : 'square-outline'}
          size={22}
          color={acknowledged ? Brand.primary : Brand.charcoal}
        />
        <ThemedText style={styles.checkboxLabel}>
          I acknowledge the{' '}
          <ThemedText
            type="linkPrimary"
            onPress={() => router.push('/burger-club/terms')}
            accessibilityRole="link"
          >
            Burger Club terms
          </ThemedText>
        </ThemedText>
      </Pressable>

      <Button
        label="Continue to scan"
        onPress={() => router.push('/redemption/scan')}
        disabled={!acknowledged}
        size="large"
      />
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
    marginBottom: Spacing.one,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
});

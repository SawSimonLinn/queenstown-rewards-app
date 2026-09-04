import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { RewardStateBadge } from '@/components/rewards/reward-state-badge';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FadingImage } from '@/components/ui/fading-image';
import { Brand, IconSize, Radius, Spacing } from '@/constants/theme';
import { useBrand } from '@/hooks/use-brand';
import { pickStockImage, STOCK_BURGER_IMAGES } from '@/data/stock-images';
import { isRedeemable } from '@/lib/eligibility';
import { formatDate } from '@/lib/format';
import type { BurgerCampaign, EntitlementStatus } from '@/types';

export type ClubRewardCardProps = {
  campaign: BurgerCampaign;
  status: EntitlementStatus;
  periodMonth?: string;
  memberName?: string | null;
  preferredLocationName?: string | null;
  participatingLocationCount: number;
  onRedeemPress: () => void;
  onViewTermsPress: () => void;
  onViewDetailsPress: () => void;
};

export function ClubRewardCard({
  campaign,
  status,
  periodMonth,
  memberName,
  preferredLocationName,
  participatingLocationCount,
  onRedeemPress,
  onViewTermsPress,
  onViewDetailsPress,
}: ClubRewardCardProps) {
  const brand = useBrand();
  const canRedeem = isRedeemable(status);
  const isRedeemed = status === 'redeemed';
  const actionLabel = canRedeem
    ? 'Scan to Redeem'
    : isRedeemed
      ? 'Redeemed this month'
      : 'Not available';

  return (
    <Card
      noPadding
      elevated={canRedeem}
      accessibilityLabel="Your monthly burger"
      style={styles.card}
    >
      <View style={styles.hero}>
        <FadingImage
          source={campaign.imageUrl ?? pickStockImage(STOCK_BURGER_IMAGES, campaign.id)}
          height={220}
          radius={0}
          fallbackIcon={canRedeem ? 'fast-food' : 'fast-food-outline'}
          fallbackLabel="Monthly burger crop"
          fallbackTone="golden"
        />

        <LinearGradient
          colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)']}
          style={styles.heroTopScrim}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
          style={styles.heroBottomScrim}
          pointerEvents="none"
        />

        <View style={styles.heroContent}>
          <View style={styles.passHeaderTop}>
            <View style={styles.eyebrowRow}>
              <Ionicons name="ribbon" size={16} color={Brand.onPrimary} />
              <ThemedText type="eyebrow" numberOfLines={1} style={styles.passEyebrow}>
                Burger Club Pass
              </ThemedText>
            </View>
            {isRedeemed ? null : <RewardStateBadge status={status} solid />}
          </View>

          <View style={styles.heroTextBlock}>
            <ThemedText type="editorial" style={styles.passName}>
              {memberName ?? campaign.name}
            </ThemedText>
            <ThemedText type="small" style={styles.passSubcopy}>
              Expires {formatDate(campaign.endDate)} · {formatPeriod(periodMonth)}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.metaList}>
        <PassLine
          icon="location-outline"
          label="Selected restaurant"
          value={preferredLocationName ?? 'Choose one in Locations'}
          hint={`${participatingLocationCount} locations`}
        />
        <PassLine
          icon="restaurant-outline"
          label="Requirement"
          value="Purchase another qualifying entree"
          emphasized
          emphasisColor={brand.primary}
          emphasisTextColor={brand.primaryDark}
        />
      </View>

      <View style={styles.actions}>
        <Button label={actionLabel} onPress={onRedeemPress} disabled={!canRedeem} size="large" />
        <View style={styles.termsRow}>
          <ThemedText type="linkPrimary" onPress={onViewDetailsPress}>
            Reward details
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {' · '}
          </ThemedText>
          <ThemedText type="linkPrimary" onPress={onViewTermsPress}>
            Club terms
          </ThemedText>
        </View>
      </View>
    </Card>
  );
}

function PassLine({
  icon,
  label,
  value,
  hint,
  emphasized,
  emphasisColor,
  emphasisTextColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  hint?: string;
  emphasized?: boolean;
  emphasisColor?: string;
  emphasisTextColor?: string;
}) {
  return (
    <View style={styles.passLine}>
      <Ionicons
        name={icon}
        size={IconSize.medium}
        color={emphasized ? emphasisColor : Brand.charcoal}
      />
      <View style={styles.passLineText}>
        <ThemedText type="eyebrow" themeColor="textSecondary">
          {label}
        </ThemedText>
        <ThemedText
          type="smallBold"
          style={emphasized ? { color: emphasisTextColor } : undefined}
        >
          {value}
        </ThemedText>
      </View>
      {hint ? (
        <ThemedText type="small" themeColor="textSecondary">
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

function formatPeriod(periodMonth?: string): string {
  if (!periodMonth) return 'Current monthly issue';
  const [year, month] = periodMonth.split('-').map(Number);
  if (!year || !month) return periodMonth;
  return new Date(year, month - 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  hero: {
    overflow: 'hidden',
  },
  heroTopScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 72,
  },
  heroBottomScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  heroContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.three,
    justifyContent: 'space-between',
  },
  passHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  heroTextBlock: {
    gap: 2,
  },
  passEyebrow: {
    color: Brand.onPrimary,
  },
  passName: {
    color: Brand.onPrimary,
  },
  passSubcopy: {
    color: Brand.onPrimary,
  },
  divider: {
    marginHorizontal: Spacing.three,
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
    borderTopWidth: 1,
    borderColor: `${Brand.charcoal}14`,
  },
  metaList: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.one,
    gap: Spacing.two,
  },
  passLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  passLineText: {
    flex: 1,
    gap: 2,
  },
  actions: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  termsRow: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
});

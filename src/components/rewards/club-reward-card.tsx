import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { RewardStateBadge } from '@/components/rewards/reward-state-badge';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FoodImagePlaceholder } from '@/components/ui/food-image-placeholder';
import { OrganicEdge } from '@/components/ui/organic-edge';
import { Brand, IconSize, Radius, Spacing } from '@/constants/theme';
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
}: ClubRewardCardProps) {
  const canRedeem = isRedeemable(status);

  return (
    <Card
      noPadding
      elevated={canRedeem}
      accessibilityLabel="Your monthly burger"
      style={styles.card}
    >
      <View style={[styles.passHeader, !canRedeem && styles.passHeaderMuted]}>
        <View style={styles.passMark}>
          <ThemedText type="editorial" style={styles.passMarkText}>
            Q
          </ThemedText>
        </View>
        <View style={styles.passHeaderText}>
          <ThemedText
            type="eyebrow"
            style={[styles.passEyebrow, !canRedeem && styles.passTextMuted]}
          >
            Burger Club Pass
          </ThemedText>
          <ThemedText type="small" style={[styles.passSubcopy, !canRedeem && styles.passTextMuted]}>
            {formatPeriod(periodMonth)}
          </ThemedText>
        </View>
        <RewardStateBadge status={status} />
      </View>
      <OrganicEdge color={Brand.onPrimary} height={16} />

      <View style={styles.ticketBody}>
        <FoodImagePlaceholder
          height={156}
          radius={Radius.medium}
          icon={canRedeem ? 'fast-food' : 'fast-food-outline'}
          label="Monthly burger crop"
          tone="golden"
        />

        <View style={styles.body}>
          <ThemedText type="editorial">{campaign.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Member: {memberName ?? 'Queenstown Rewards member'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Expires {formatDate(campaign.endDate)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.metaList}>
        <PassLine
          icon="storefront-outline"
          label="Participating restaurants"
          value={`${participatingLocationCount} locations`}
        />
        <PassLine
          icon="location-outline"
          label="Selected restaurant"
          value={preferredLocationName ?? 'Choose one in Locations'}
        />
        <PassLine
          icon="restaurant-outline"
          label="Requirement"
          value="Purchase another qualifying entree"
          emphasized
        />
      </View>

      <View style={styles.actions}>
        <Button
          label={canRedeem ? 'Redeem at Restaurant' : 'Not available'}
          onPress={onRedeemPress}
          disabled={!canRedeem}
          size="large"
        />
        <ThemedText type="linkPrimary" onPress={onViewTermsPress} style={styles.termsLink}>
          View Burger Club terms
        </ThemedText>
      </View>
    </Card>
  );
}

function PassLine({
  icon,
  label,
  value,
  emphasized,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <View style={styles.passLine}>
      <Ionicons
        name={icon}
        size={IconSize.medium}
        color={emphasized ? Brand.primary : Brand.charcoal}
      />
      <View style={styles.passLineText}>
        <ThemedText type="eyebrow" themeColor="textSecondary">
          {label}
        </ThemedText>
        <ThemedText type="smallBold" style={emphasized ? styles.emphasizedText : undefined}>
          {value}
        </ThemedText>
      </View>
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
  passHeader: {
    backgroundColor: Brand.primary,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  passHeaderMuted: {
    backgroundColor: Brand.mutedSurface,
  },
  passMark: {
    width: 40,
    height: 40,
    borderRadius: Radius.small,
    backgroundColor: Brand.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passMarkText: {
    color: Brand.primary,
    fontSize: 22,
    lineHeight: 26,
  },
  passHeaderText: {
    flex: 1,
    gap: 2,
  },
  passEyebrow: {
    color: Brand.onPrimary,
  },
  passSubcopy: {
    color: Brand.onPrimary,
  },
  passTextMuted: {
    color: Brand.charcoal,
  },
  ticketBody: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  body: {
    gap: 4,
  },
  divider: {
    marginHorizontal: Spacing.three,
    borderTopWidth: 1,
    borderColor: `${Brand.charcoal}14`,
  },
  metaList: {
    paddingHorizontal: Spacing.three,
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
  emphasizedText: {
    color: Brand.primaryDark,
  },
  actions: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  termsLink: {
    alignSelf: 'center',
  },
});

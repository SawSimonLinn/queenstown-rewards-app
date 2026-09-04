import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { RewardStateBadge } from '@/components/rewards/reward-state-badge';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FadingImage } from '@/components/ui/fading-image';
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
      <View style={[styles.passHeader, !canRedeem && styles.passHeaderMuted]}>
        <View style={styles.passHeaderTop}>
          <View style={[styles.passMark, !canRedeem && styles.passMarkMuted]}>
            <ThemedText
              type="editorial"
              style={[styles.passMarkText, !canRedeem && styles.passMarkTextMuted]}
            >
              Q
            </ThemedText>
          </View>
          <View style={styles.passHeaderText}>
            <ThemedText
              type="eyebrow"
              numberOfLines={1}
              style={[styles.passEyebrow, !canRedeem && styles.passTextMuted]}
            >
              Burger Club Pass
            </ThemedText>
            <ThemedText
              type="small"
              numberOfLines={1}
              style={[styles.passSubcopy, !canRedeem && styles.passTextMuted]}
            >
              {formatPeriod(periodMonth)}
            </ThemedText>
          </View>
        </View>
        {isRedeemed ? null : (
          <View style={styles.passHeaderBadge}>
            <RewardStateBadge status={status} />
          </View>
        )}
      </View>
      <OrganicEdge color={Brand.onPrimary} height={16} />

      <View style={styles.ticketBody}>
        <FadingImage
          source={campaign.imageUrl}
          height={156}
          radius={Radius.medium}
          fallbackIcon={canRedeem ? 'fast-food' : 'fast-food-outline'}
          fallbackLabel="Monthly burger crop"
          fallbackTone="golden"
        />

        <View style={styles.body}>
          <ThemedText type="editorial">{memberName ?? campaign.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Expires {formatDate(campaign.endDate)}
          </ThemedText>
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
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  hint?: string;
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
  passHeader: {
    backgroundColor: Brand.primary,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  passHeaderMuted: {
    backgroundColor: Brand.mutedSurface,
  },
  passHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  passHeaderBadge: {
    alignSelf: 'flex-start',
    marginLeft: 40 + Spacing.two,
  },
  passMark: {
    width: 40,
    height: 40,
    borderRadius: Radius.small,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passMarkMuted: {
    backgroundColor: Brand.onPrimary,
  },
  passMarkText: {
    color: Brand.onPrimary,
    fontSize: 22,
    lineHeight: 26,
  },
  passMarkTextMuted: {
    color: Brand.primary,
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
  emphasizedText: {
    color: Brand.primaryDark,
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

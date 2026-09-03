import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { RewardStateBadge } from '@/components/rewards/reward-state-badge';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { FoodImagePlaceholder } from '@/components/ui/food-image-placeholder';
import { ScreenContainer } from '@/components/ui/screen-container';
import { HeroCardSkeleton } from '@/components/ui/skeleton';
import { IS_SAMPLE_DATA, MAX_REDEMPTIONS_PER_PERIOD, REWARD_PERIOD } from '@/constants/app';
import { Brand, IconSize, Radius, Spacing } from '@/constants/theme';
import { useBurgerCampaignDetail } from '@/hooks/use-burger-campaign-detail';
import { isRedeemable } from '@/lib/eligibility';
import { formatDateRange } from '@/lib/format';
import type { BurgerCampaignDetail } from '@/services/burger';

export default function BurgerOfMonthDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, retry } = useBurgerCampaignDetail(id);
  const router = useRouter();

  return (
    <ScreenContainer scroll edgeToEdge={state.status === 'success'}>
      {state.status === 'loading' && (
        <View style={styles.padded}>
          <HeroCardSkeleton />
        </View>
      )}

      {state.status === 'error' && (
        <View style={styles.padded}>
          <ErrorState message={state.message} onRetry={retry} />
        </View>
      )}

      {state.status === 'not-found' && (
        <View style={styles.padded}>
          <Card accessibilityLabel="Campaign not found">
            <ThemedText themeColor="textSecondary">
              This Burger of the Month campaign couldn&apos;t be found. It may have ended.
            </ThemedText>
          </Card>
        </View>
      )}

      {state.status === 'success' && (
        <BurgerOfMonthDetail
          data={state.data}
          onRedeemPress={() => router.push('/redemption/confirm')}
        />
      )}
    </ScreenContainer>
  );
}

type BurgerOfMonthDetailProps = {
  data: BurgerCampaignDetail;
  onRedeemPress: () => void;
};

function BurgerOfMonthDetail({ data, onRedeemPress }: BurgerOfMonthDetailProps) {
  const { campaign, entitlement, participatingLocations } = data;
  const status = entitlement?.status ?? 'ineligible';
  const canRedeem = isRedeemable(status);

  return (
    <>
      <View style={styles.hero}>
        <FoodImagePlaceholder
          height={300}
          radius={0}
          icon="fast-food"
          label="Burger of the Month"
        />
      </View>

      <View style={[styles.content, styles.padded]}>
        <View style={styles.passRow}>
          <View style={styles.passStamp}>
            <Ionicons name="ribbon" size={16} color={Brand.onPrimary} />
            <ThemedText type="eyebrow" style={styles.passStampText}>
              Monthly campaign
            </ThemedText>
          </View>
          <RewardStateBadge status={status} />
        </View>

        <ThemedText type="display" style={styles.name}>
          {campaign.name}
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.description}>
          {campaign.description}
        </ThemedText>

        {IS_SAMPLE_DATA && (
          <View style={styles.sampleNotice}>
            <Ionicons name="information-circle-outline" size={14} color={Brand.warning} />
            <ThemedText type="small" style={{ color: Brand.warning }}>
              Sample content — not official Queenstown pricing or terms.
            </ThemedText>
          </View>
        )}

        <View style={styles.requirementPanel}>
          <Ionicons name="restaurant-outline" size={IconSize.large} color={Brand.primaryDark} />
          <View style={styles.requirementTextGroup}>
            <ThemedText type="smallBold" style={styles.requirementTitle}>
              Qualifying entree required
            </ThemedText>
            <ThemedText type="small" style={styles.requirementCopy}>
              Redeem this burger with the purchase of another qualifying entree at a participating
              location.
            </ThemedText>
          </View>
        </View>

        <View style={styles.sectionList}>
          <InfoRow icon="calendar-outline" label="Available">
            {formatDateRange(campaign.startDate, campaign.endDate)}
          </InfoRow>
          <Divider />
          <InfoRow icon="gift-outline" label="What's included">
            One free {campaign.name}, {MAX_REDEMPTIONS_PER_PERIOD} redemption per {REWARD_PERIOD}{' '}
            eligible customer.
          </InfoRow>
          <Divider />
          <InfoRow icon="document-text-outline" label="Terms & restrictions">
            {campaign.termsAndRestrictions}
          </InfoRow>
          <Divider />
          <InfoRow icon="warning-outline" label="Allergens">
            Contains gluten, dairy and sesame. Ask staff about ingredients if you have allergies or
            dietary requirements.
          </InfoRow>
        </View>

        <View style={styles.locationsSection} accessibilityLabel="Participating locations">
          <View style={styles.sectionHeadingRow}>
            <Ionicons name="location-outline" size={IconSize.medium} color={Brand.primary} />
            <ThemedText type="smallBold">Participating locations</ThemedText>
          </View>
          {participatingLocations.length === 0 ? (
            <ThemedText themeColor="textSecondary">
              No participating locations listed yet.
            </ThemedText>
          ) : (
            <View style={styles.locationList}>
              {participatingLocations.map((location, index) => (
                <View
                  key={location.id}
                  style={[
                    styles.locationRow,
                    index < participatingLocations.length - 1 && styles.locationRowBorder,
                  ]}
                >
                  <ThemedText themeColor="textSecondary">{location.name}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.stickyButton}>
          <Button
            label={canRedeem ? 'Redeem your burger' : 'Not available'}
            onPress={onRedeemPress}
            disabled={!canRedeem}
            size="large"
            accessibilityHint={
              canRedeem
                ? 'Opens the QR scanner to redeem this reward in store'
                : 'This reward is not currently available to redeem'
            }
          />
        </View>
      </View>
    </>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={IconSize.medium} color={Brand.primary} />
      </View>
      <View style={styles.infoTextGroup}>
        <ThemedText type="smallBold">{label}</ThemedText>
        <ThemedText themeColor="textSecondary">{children}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: Spacing.four,
  },
  hero: {
    backgroundColor: Brand.primaryTint,
  },
  content: {
    backgroundColor: Brand.onPrimary,
    borderTopLeftRadius: Radius.xlarge,
    borderTopRightRadius: Radius.xlarge,
    marginTop: -Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  passRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  passStamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Brand.primary,
    borderRadius: Radius.small,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
  },
  passStampText: {
    color: Brand.onPrimary,
  },
  name: {
    color: Brand.charcoal,
  },
  description: {
    fontSize: 17,
    lineHeight: 25,
  },
  sampleNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  requirementPanel: {
    flexDirection: 'row',
    gap: Spacing.three,
    borderRadius: Radius.large,
    borderWidth: 1,
    borderColor: `${Brand.primary}40`,
    backgroundColor: Brand.primaryTint,
    padding: Spacing.three,
  },
  requirementTextGroup: {
    flex: 1,
    gap: 2,
  },
  requirementTitle: {
    color: Brand.primaryDark,
  },
  requirementCopy: {
    color: Brand.primaryDark,
  },
  sectionList: {
    borderTopWidth: 1,
    borderTopColor: `${Brand.charcoal}14`,
  },
  divider: {
    height: 1,
    backgroundColor: `${Brand.charcoal}14`,
    marginLeft: 36 + Spacing.three,
  },
  infoRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.small,
    backgroundColor: `${Brand.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextGroup: {
    flex: 1,
    gap: 2,
  },
  locationsSection: {
    gap: Spacing.two,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  locationList: {
    borderTopWidth: 1,
    borderTopColor: `${Brand.charcoal}14`,
  },
  locationRow: {
    paddingVertical: Spacing.two,
  },
  locationRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: `${Brand.charcoal}14`,
  },
  stickyButton: {
    paddingTop: Spacing.two,
  },
});

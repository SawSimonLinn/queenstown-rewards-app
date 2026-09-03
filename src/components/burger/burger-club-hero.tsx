import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { RewardStateBadge } from '@/components/rewards/reward-state-badge';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FadingImage } from '@/components/ui/fading-image';
import { IS_SAMPLE_DATA } from '@/constants/app';
import { Brand, Radius, Shadows, Spacing } from '@/constants/theme';
import type { RestaurantLocation } from '@/data/types';
import { isRedeemable } from '@/lib/eligibility';
import { formatDate } from '@/lib/format';
import type { BurgerCampaign, MonthlyEntitlement } from '@/types';

export type HeroCtaState = 'guest' | 'join' | 'eligible' | 'redeemed' | 'no-campaign';

const CTA_COPY: Record<HeroCtaState, string> = {
  guest: 'Sign in to join',
  join: 'Join the Club',
  eligible: 'Scan to Redeem',
  redeemed: 'Redeemed this month',
  'no-campaign': 'Check back soon',
};

export type BurgerClubHeroProps = {
  campaign: BurgerCampaign | null;
  entitlement: MonthlyEntitlement | null;
  preferredLocation: RestaurantLocation | null;
  ctaState: HeroCtaState;
  onCtaPress: () => void;
};

export function BurgerClubHero({
  campaign,
  entitlement,
  preferredLocation,
  ctaState,
  onCtaPress,
}: BurgerClubHeroProps) {
  const canRedeem = entitlement ? isRedeemable(entitlement.status) : false;
  const ctaDisabled = ctaState === 'redeemed' || ctaState === 'no-campaign';

  return (
    <Card noPadding elevated style={styles.card} accessibilityLabel="Burger of the Month Club">
      <LinearGradient
        colors={[Brand.primary, Brand.primaryDark, Brand.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ticketTop}
      >
        <View style={styles.stubRow}>
          <View style={styles.eyebrowRow}>
            <Ionicons name="ribbon" size={16} color={Brand.onPrimary} />
            <ThemedText type="eyebrow" style={styles.eyebrowText}>
              Burger Club
            </ThemedText>
          </View>
          {entitlement && <RewardStateBadge status={entitlement.status} />}
        </View>

        <ThemedText type="display" style={styles.heroHeading}>
          Burger of the Month
        </ThemedText>

        {campaign && (
          <FadingImage
            source={campaign.imageUrl}
            height={174}
            radius={Radius.medium}
            fallbackIcon="fast-food"
            fallbackLabel="Burger campaign crop"
          />
        )}
      </LinearGradient>

      <View style={styles.body}>
        {campaign ? (
          <>
            <View style={styles.nameRow}>
              <ThemedText type="editorial" style={styles.name}>
                {campaign.name}
              </ThemedText>
              {IS_SAMPLE_DATA && (
                <View style={styles.previewTag}>
                  <ThemedText type="smallBold" style={styles.previewText}>
                    Preview
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText themeColor="textSecondary" numberOfLines={2}>
              {campaign.description}
            </ThemedText>

            <View style={styles.metaGrid}>
              {entitlement && (
                <MetaItem
                  label="Status"
                  value={canRedeem ? 'Ready to redeem' : entitlement.status}
                />
              )}
              <MetaItem label="Expires" value={formatDate(campaign.endDate)} />
              {preferredLocation && <MetaItem label="Restaurant" value={preferredLocation.name} />}
            </View>

            <View style={styles.requirementRow}>
              <Ionicons name="restaurant-outline" size={16} color={Brand.primaryDark} />
              <ThemedText type="smallBold" style={styles.requirementText}>
                With another qualifying entrée
              </ThemedText>
            </View>

            <View style={styles.actions}>
              <Button
                label={CTA_COPY[ctaState]}
                onPress={onCtaPress}
                disabled={ctaDisabled}
                size="large"
              />
            </View>
          </>
        ) : (
          <ThemedText themeColor="textSecondary">
            We&apos;re between monthly burgers right now — check back soon.
          </ThemedText>
        )}
      </View>
    </Card>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <ThemedText type="eyebrow" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold" numberOfLines={1}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    ...Shadows.raised,
  },
  ticketTop: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  stubRow: {
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
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  eyebrowText: {
    color: Brand.onPrimary,
  },
  heroHeading: {
    color: Brand.onPrimary,
    maxWidth: 320,
  },
  body: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  name: {
    flex: 1,
  },
  previewTag: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radius.small,
    backgroundColor: `${Brand.secondary}33`,
  },
  previewText: {
    color: Brand.secondaryDark,
    fontWeight: '700',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  metaItem: {
    minWidth: 128,
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: `${Brand.charcoal}14`,
    paddingTop: Spacing.two,
    gap: 2,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: `${Brand.primary}33`,
    backgroundColor: Brand.primaryTint,
    borderRadius: Radius.medium,
    padding: Spacing.three,
  },
  requirementText: {
    color: Brand.primaryDark,
    flex: 1,
  },
  actions: {
    gap: Spacing.two,
  },
});

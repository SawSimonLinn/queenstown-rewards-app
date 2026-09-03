import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { InlineFeedback } from '@/components/ui/inline-feedback';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { ScreenContainer } from '@/components/ui/screen-container';
import { StatusBadge } from '@/components/ui/status-badge';
import { Brand, IconSize, Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useStaffLocationOptions } from '@/hooks/use-staff-location-options';
import {
  useStaffRedemptions,
  type StaffRedemptionsSegment,
} from '@/hooks/use-staff-redemptions';
import { formatDate } from '@/lib/format';
import { useProfileContext } from '@/lib/profile';
import { REDEMPTION_STATUS_COPY } from '@/lib/redemption-status-copy';
import type { StaffRedemption } from '@/services/staff';

export default function RequestsScreen() {
  const { profile } = useProfileContext();
  const [segment, setSegment] = useState<StaffRedemptionsSegment>('pending');
  const [locationId, setLocationId] = useState<string | null>(null);
  const locationOptionsState = useStaffLocationOptions();
  const { state, retry, confirm, confirmingId, confirmError } = useStaffRedemptions(
    segment,
    locationId
  );

  if (profile && profile.role === 'customer') {
    return (
      <ScreenContainer>
        <EmptyState
          icon="lock-closed-outline"
          title="Staff access only"
          message="This screen is for Queenstown Rewards staff accounts only."
        />
      </ScreenContainer>
    );
  }

  const locationOptions =
    locationOptionsState.status === 'success' ? locationOptionsState.options : [];

  return (
    <ScreenContainer scroll onRefresh={retry} refreshing={state.status === 'loading'}>
      <AppHeader eyebrow="Staff" title="Requests" />

      <View style={styles.filters}>
        <SegmentedControl
          options={[
            { key: 'pending', label: 'Pending' },
            { key: 'history', label: 'History' },
          ]}
          value={segment}
          onChange={setSegment}
        />

        {locationOptions.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.locationRow}
          >
            <LocationChip
              label="All locations"
              active={locationId === null}
              onPress={() => setLocationId(null)}
            />
            {locationOptions.map((option) => (
              <LocationChip
                key={option.id}
                label={option.name}
                active={locationId === option.id}
                onPress={() => setLocationId(option.id)}
              />
            ))}
          </ScrollView>
        ) : (
          locationOptions.length === 1 && (
            <View style={styles.singleLocationRow}>
              <Ionicons name="storefront-outline" size={IconSize.small} color={Brand.primary} />
              <ThemedText type="small" themeColor="textSecondary">
                {locationOptions[0].name}
              </ThemedText>
            </View>
          )
        )}
      </View>

      {confirmError && <InlineFeedback message={confirmError} />}

      {state.status === 'loading' && (
        <View style={styles.list}>
          <CardSkeleton />
          <CardSkeleton />
        </View>
      )}

      {state.status === 'error' && <ErrorState message={state.message} onRetry={retry} />}

      {state.status === 'success' &&
        (state.redemptions.length === 0 ? (
          <EmptyState
            icon={segment === 'pending' ? 'checkmark-done-outline' : 'time-outline'}
            title={segment === 'pending' ? 'All caught up' : 'No history yet'}
            message={
              segment === 'pending'
                ? 'No pending redemptions right now.'
                : 'Confirmed redemptions will show up here.'
            }
          />
        ) : (
          <View style={styles.list}>
            {state.redemptions.map((redemption) => (
              <RedemptionCard
                key={redemption.id}
                redemption={redemption}
                showConfirm={segment === 'pending'}
                confirming={confirmingId === redemption.id}
                onConfirm={() => confirm(redemption.id)}
              />
            ))}
          </View>
        ))}
    </ScreenContainer>
  );
}

function LocationChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.chip,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        active && styles.chipActive,
      ]}
    >
      <ThemedText
        type="small"
        style={active ? styles.chipLabelActive : { color: theme.textSecondary }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function RedemptionCard({
  redemption,
  showConfirm,
  confirming,
  onConfirm,
}: {
  redemption: StaffRedemption;
  showConfirm: boolean;
  confirming: boolean;
  onConfirm: () => void;
}) {
  const theme = useTheme();
  const copy = REDEMPTION_STATUS_COPY[redemption.status];

  return (
    <Card
      noPadding
      elevated={showConfirm}
      accessibilityLabel={`${redemption.customerName}, ${copy.label}`}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <ThemedText type="smallBold" style={styles.avatarText}>
            {initialsFor(redemption.customerName)}
          </ThemedText>
        </View>
        <View style={styles.cardHeaderText}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {redemption.customerName}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {redemption.customerEmail}
          </ThemedText>
        </View>
        <StatusBadge label={copy.label} tone={copy.tone} />
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <InfoRow icon="restaurant-outline" text={redemption.campaignName} />
        <InfoRow icon="storefront-outline" text={redemption.locationName} />
        <InfoRow
          icon="calendar-outline"
          text={showConfirm ? `Requested ${formatDate(redemption.redeemedAt)}` : formatDate(redemption.redeemedAt)}
        />
      </View>

      {showConfirm && (
        <View style={styles.cardActions}>
          <Button
            label="Confirm redemption"
            loading={confirming}
            loadingLabel="Confirming"
            onPress={onConfirm}
          />
        </View>
      )}
    </Card>
  );

  function InfoRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
    return (
      <View style={styles.infoRow}>
        <Ionicons name={icon} size={IconSize.small} color={theme.textMuted} />
        <ThemedText type="small" themeColor="textSecondary" style={styles.infoRowText}>
          {text}
        </ThemedText>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  filters: {
    gap: Spacing.three,
  },
  locationRow: {
    gap: Spacing.two,
    paddingRight: Spacing.four,
  },
  singleLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
    ...Shadows.card,
  },
  chipActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  chipLabelActive: {
    color: Brand.onPrimary,
    fontWeight: '700',
  },
  list: {
    gap: Spacing.three,
  },
  card: {
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Brand.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Brand.primaryDark,
  },
  cardHeaderText: {
    flex: 1,
    gap: 1,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: `${Brand.charcoal}12`,
  },
  cardBody: {
    padding: Spacing.three,
    gap: Spacing.one + 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  infoRowText: {
    flex: 1,
  },
  cardActions: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
});

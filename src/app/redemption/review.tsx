import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Brand, IconSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useQrValidation } from '@/hooks/use-qr-validation';
import { cancelPendingRedemption, getRedemptionStatus } from '@/services/redemption';
import type { RedemptionErrorCode } from '@/services/redemption';

const REJECTION_COPY: Record<RedemptionErrorCode, { title: string; body: string }> = {
  invalid_qr: {
    title: 'Invalid QR code',
    body: "This doesn't look like a Queenstown Rewards redemption code. Make sure you're scanning the official code at the counter.",
  },
  expired_qr: {
    title: 'This code has expired',
    body: 'Ask a staff member for a current redemption code.',
  },
  wrong_location: {
    title: 'Wrong location',
    body: "This code is for a different location than the one you've selected. Make sure you're scanning the code at the right restaurant.",
  },
  already_redeemed: {
    title: 'Already redeemed',
    body: "You've already redeemed your Burger of the Month reward this month.",
  },
  ineligible: {
    title: 'Not eligible',
    body: "You're not eligible for a reward this month.",
  },
  not_authenticated: {
    title: 'Sign in required',
    body: 'Please sign in again to redeem a reward.',
  },
  unknown: {
    title: "Couldn't process this code",
    body: 'Something went wrong. Please try again.',
  },
};

// How often to check whether staff has confirmed the redemption yet.
const POLL_INTERVAL_MS = 3000;

export default function ReviewScreen() {
  const { token, locationId } = useLocalSearchParams<{ token: string; locationId: string }>();
  const { state, retry } = useQrValidation(token, locationId);
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [confirmedAt, setConfirmedAt] = useState<Date | null>(null);

  const scanAgain = () => router.replace('/redemption/scan');
  const goHome = () => router.replace('/');

  useEffect(() => {
    if (state.status !== 'pending' || confirmedAt) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const status = await getRedemptionStatus(state.result.redemptionId);
        if (cancelled) return;
        if (status === 'confirmed') {
          setConfirmedAt(new Date());
        }
      } catch {
        // Transient network hiccups shouldn't interrupt the wait — the next tick retries.
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status === 'pending' ? state.result.redemptionId : null, confirmedAt]);

  const handleCancel = async (redemptionId: string) => {
    setCancelError(null);
    setIsCancelling(true);
    try {
      await cancelPendingRedemption(redemptionId);
      goHome();
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : 'Could not cancel this request.');
      setIsCancelling(false);
    }
  };

  return (
    <ScreenContainer scroll>
      {state.status === 'loading' && (
        <Card accessibilityLabel="Checking QR code">
          <ThemedText themeColor="textSecondary">Checking QR code…</ThemedText>
        </Card>
      )}

      {state.status === 'network-error' && (
        <>
          <ErrorState message={state.message} onRetry={retry} />
          <Button label="Cancel" variant="outline" onPress={goHome} />
        </>
      )}

      {state.status === 'rejected' &&
        (() => {
          const copy = REJECTION_COPY[state.code];
          return (
            <Card accessibilityLabel={copy.title}>
              <View style={styles.rejectionIconWrap}>
                <Ionicons name="close" size={IconSize.xlarge} color={Brand.danger} />
              </View>
              <ThemedText type="subtitle">{copy.title}</ThemedText>
              <ThemedText themeColor="textSecondary">{copy.body}</ThemedText>
              <Button label="Scan again" onPress={scanAgain} />
              <Button label="Cancel" variant="outline" onPress={goHome} />
            </Card>
          );
        })()}

      {state.status === 'pending' && !confirmedAt && (
        <>
          <ThemedText type="title">Show this to staff</ThemedText>
          <Card accessibilityLabel="Redemption summary">
            <ThemedText type="smallBold">{state.result.campaignName}</ThemedText>
            <ThemedText themeColor="textSecondary">at {state.result.locationName}</ThemedText>
          </Card>
          <Card accessibilityLabel="Waiting for staff confirmation">
            <View style={styles.waitingRow}>
              <PulsingDot />
              <ThemedText type="smallBold">Waiting for staff confirmation…</ThemedText>
            </View>
            <ThemedText themeColor="textSecondary">
              Ask a staff member to confirm your redemption on their device. Your reward isn&apos;t
              used until they do — this screen updates automatically.
            </ThemedText>
          </Card>
          {cancelError && (
            <Card accessibilityLabel="Cancel error">
              <ThemedText style={{ color: Brand.danger }}>{cancelError}</ThemedText>
            </Card>
          )}
          <Button
            label="Cancel request"
            variant="outline"
            loading={isCancelling}
            onPress={() => handleCancel(state.result.redemptionId)}
          />
        </>
      )}

      {state.status === 'pending' && confirmedAt && (
        <RedemptionSuccess
          campaignName={state.result.campaignName}
          locationName={state.result.locationName}
          redemptionId={state.result.redemptionId}
          confirmedAt={confirmedAt}
          onDone={goHome}
        />
      )}
    </ScreenContainer>
  );
}

function PulsingDot() {
  return <View style={styles.dot} />;
}

function RedemptionSuccess({
  campaignName,
  locationName,
  redemptionId,
  confirmedAt,
  onDone,
}: {
  campaignName: string;
  locationName: string;
  redemptionId: string;
  confirmedAt: Date;
  onDone: () => void;
}) {
  const reference = redemptionId.slice(0, 8).toUpperCase();

  return (
    <>
      <View style={styles.stampRing}>
        <View style={styles.stampCore}>
          <Ionicons name="checkmark" size={34} color={Brand.onPrimary} />
        </View>
      </View>
      <ThemedText type="editorial" style={styles.center}>
        Redemption confirmed!
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.center}>
        Enjoy your {campaignName}.
      </ThemedText>

      <Card accessibilityLabel="Redemption details">
        <SuccessRow label="Reward" value={campaignName} />
        <SuccessRow label="Location" value={locationName} />
        <SuccessRow
          label="Redeemed"
          value={`${confirmedAt.toLocaleDateString()} at ${confirmedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
        />
        <SuccessRow label="Confirmation reference" value={reference} monospace />
      </Card>

      <Button label="Back to home" onPress={onDone} size="large" />
    </>
  );
}

function SuccessRow({
  label,
  value,
  monospace,
}: {
  label: string;
  value: string;
  monospace?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.successRow, { borderBottomColor: theme.border }]}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type={monospace ? 'code' : 'smallBold'}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  rejectionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Brand.danger}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Brand.secondary,
  },
  stampRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: Spacing.three,
    transform: [{ rotate: '-6deg' }],
  },
  stampCore: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    textAlign: 'center',
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

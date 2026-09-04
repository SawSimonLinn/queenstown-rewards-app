import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { FadeInView, MotionDuration } from '@/components/ui/motion';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Brand, IconSize, Spacing } from '@/constants/theme';
import { useBrand } from '@/hooks/use-brand';
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
  not_club_member: {
    title: 'Join the Burger Club',
    body: 'You need to join the Burger of the Month Club before you can redeem this code.',
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
  const brand = useBrand();
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
        <FadeInView>
          <Card accessibilityLabel="Checking QR code">
            <View style={styles.waitingRow}>
              <ActivityIndicator size="small" color={brand.primary} />
              <ThemedText themeColor="textSecondary">Checking QR code…</ThemedText>
            </View>
          </Card>
        </FadeInView>
      )}

      {state.status === 'network-error' && (
        <FadeInView style={styles.contentGroup}>
          <ErrorState message={state.message} onRetry={retry} />
          <Button label="Cancel" variant="outline" onPress={goHome} />
        </FadeInView>
      )}

      {state.status === 'rejected' &&
        (() => {
          const copy = REJECTION_COPY[state.code];
          return (
            <FadeInView>
              <Card accessibilityLabel={copy.title}>
                <View style={styles.rejectionIconWrap}>
                  <Ionicons name="close" size={IconSize.xlarge} color={Brand.danger} />
                </View>
                <ThemedText type="subtitle">{copy.title}</ThemedText>
                <ThemedText themeColor="textSecondary">{copy.body}</ThemedText>
                <Button label="Scan again" onPress={scanAgain} />
                <Button label="Cancel" variant="outline" onPress={goHome} />
              </Card>
            </FadeInView>
          );
        })()}

      {state.status === 'pending' && !confirmedAt && (
        <FadeInView slide layout style={styles.contentGroup}>
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
            loadingLabel="Cancelling"
            onPress={() => handleCancel(state.result.redemptionId)}
          />
        </FadeInView>
      )}

      {state.status === 'pending' && confirmedAt && (
        <FadeInView slide layout style={styles.contentGroup}>
          <RedemptionSuccess
            campaignName={state.result.campaignName}
            locationName={state.result.locationName}
            redemptionId={state.result.redemptionId}
            confirmedAt={confirmedAt}
            onDone={goHome}
          />
        </FadeInView>
      )}
    </ScreenContainer>
  );
}

function PulsingDot() {
  const brand = useBrand();
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(progress);
      progress.value = 1;
      return;
    }

    progress.value = withRepeat(
      withSequence(
        withTiming(0.72, { duration: MotionDuration.slow, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: MotionDuration.slow, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );

    return () => cancelAnimation(progress);
  }, [progress, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));

  return (
    <Animated.View style={[styles.dot, { backgroundColor: brand.secondary }, animatedStyle]} />
  );
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
  const brand = useBrand();
  const reference = redemptionId.slice(0, 8).toUpperCase();

  return (
    <>
      <View style={[styles.stampRing, { borderColor: brand.primary }]}>
        <View style={[styles.stampCore, { backgroundColor: brand.primary }]}>
          <Ionicons name="checkmark" size={34} color={brand.onPrimary} />
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
  contentGroup: {
    gap: Spacing.four,
  },
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

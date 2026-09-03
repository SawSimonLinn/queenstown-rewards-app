import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Brand } from '@/constants/theme';
import { usePendingRedemptions } from '@/hooks/use-pending-redemptions';
import { useProfileContext } from '@/lib/profile';

export default function PendingRedemptionsScreen() {
  const { profile } = useProfileContext();
  const { state, retry, confirm, confirmingId, confirmError } = usePendingRedemptions();

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

  return (
    <ScreenContainer scroll>
      <AppHeader title="Pending redemptions" />

      {state.status === 'loading' && (
        <>
          <CardSkeleton />
          <CardSkeleton />
        </>
      )}

      {state.status === 'error' && <ErrorState message={state.message} onRetry={retry} />}

      {confirmError && (
        <Card accessibilityLabel="Confirm error">
          <ThemedText style={{ color: Brand.danger }}>{confirmError}</ThemedText>
        </Card>
      )}

      {state.status === 'success' &&
        (state.redemptions.length === 0 ? (
          <EmptyState
            icon="checkmark-done-outline"
            title="All caught up"
            message="No pending redemptions right now."
          />
        ) : (
          <>
            {state.redemptions.map((redemption) => (
              <Card
                key={redemption.id}
                accessibilityLabel={`Pending redemption for ${redemption.customerName}`}
              >
                <ThemedText type="smallBold">{redemption.customerName}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {redemption.customerEmail}
                </ThemedText>
                <ThemedText themeColor="textSecondary">
                  {redemption.campaignName} at {redemption.locationName}
                </ThemedText>
                <Button
                  label="Confirm redemption"
                  loading={confirmingId === redemption.id}
                  onPress={() => confirm(redemption.id)}
                />
              </Card>
            ))}
          </>
        ))}
    </ScreenContainer>
  );
}

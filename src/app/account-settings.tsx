import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { MembershipStatusCard } from '@/components/membership/membership-status-card';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { FadeInView } from '@/components/ui/motion';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SectionHeader } from '@/components/ui/section-header';
import { SettingsRow, SettingsRowDivider } from '@/components/ui/settings-row';
import { MembershipSkeleton, ProfileSkeleton } from '@/components/ui/skeleton';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { usePreferredLocation } from '@/lib/preferred-location';
import { useProfileContext } from '@/lib/profile';
import { useMembership } from '@/hooks/use-membership';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { profile, isLoading: isProfileLoading } = useProfileContext();
  const { preferredLocation } = usePreferredLocation();
  const { state: membershipState, retry: retryMembership } = useMembership();

  return (
    <ScreenContainer scroll>
      {isProfileLoading && !profile ? (
        <FadeInView>
          <ProfileSkeleton />
        </FadeInView>
      ) : (
        <FadeInView layout style={styles.contentGroup}>
          <View style={styles.section}>
            <SectionHeader title="Personal details" />
            <Card noPadding style={styles.group}>
              <SettingsRow
                icon="person-outline"
                label="Edit profile"
                value={profile?.fullName ?? undefined}
                onPress={() => router.push('/edit-profile')}
              />
              <SettingsRowDivider />
              <SettingsRow
                icon="location-outline"
                label="Preferred location"
                value={
                  preferredLocation
                    ? `${preferredLocation.name} · ${preferredLocation.neighbourhood}`
                    : 'Not selected · Choose'
                }
                onPress={() => router.push('/preferred-location')}
              />
            </Card>
          </View>

          <View style={styles.section}>
            <SectionHeader title="Security" />
            <Card noPadding style={styles.group}>
              <SettingsRow
                icon="mail-outline"
                label="Email address"
                value={session?.user.email ?? undefined}
                onPress={() => router.push('/change-email')}
              />
              <SettingsRowDivider />
              <SettingsRow
                icon="lock-closed-outline"
                label="Change password"
                onPress={() => router.push('/change-password')}
              />
            </Card>
          </View>

          <View style={styles.section}>
            <SectionHeader title="Membership" />
            {membershipState.status === 'loading' && <MembershipSkeleton />}
            {membershipState.status === 'error' && (
              <ErrorState message={membershipState.message} onRetry={retryMembership} />
            )}
            {membershipState.status === 'success' &&
              (membershipState.membership ? (
                <MembershipStatusCard membership={membershipState.membership} />
              ) : (
                <Card accessibilityLabel="Not a Burger Club member">
                  <ThemedText themeColor="textSecondary">
                    You&apos;re not a Burger of the Month Club member yet.
                  </ThemedText>
                </Card>
              ))}
          </View>
        </FadeInView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  contentGroup: {
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  group: {
    borderRadius: 16,
    overflow: 'hidden',
  },
});

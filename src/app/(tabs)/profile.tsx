import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppHeader } from '@/components/ui/app-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ScreenContainer } from '@/components/ui/screen-container';
import { APP_NAME } from '@/constants/app';
import { Brand, IconSize, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { registerForPushNotificationsAsync } from '@/lib/notifications';
import { usePreferredLocation } from '@/lib/preferred-location';
import { useProfileContext } from '@/lib/profile';
import { signOut } from '@/services/auth';
import { registerPushToken, unregisterPushToken } from '@/services/push-tokens';

type PushToggleState = 'checking' | 'enabled' | 'disabled';

export default function ProfileScreen() {
  const { session } = useAuth();
  const { profile } = useProfileContext();
  const { preferredLocation } = usePreferredLocation();
  const router = useRouter();
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const [pushState, setPushState] = useState<PushToggleState>('checking');
  const [isTogglingPush, setIsTogglingPush] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);

  const checkPushStatus = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPushState(status === 'granted' ? 'enabled' : 'disabled');
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkPushStatus();
  }, [checkPushStatus]);

  const handleSignOut = async () => {
    setSignOutError(null);
    setIsSigningOut(true);
    try {
      await signOut();
      // Stack.Protected in src/app/_layout.tsx routes to (auth) automatically.
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : 'Could not sign out.');
      setIsSigningOut(false);
      setShowSignOutConfirm(false);
    }
  };

  const handleTogglePush = async () => {
    setPushError(null);
    setIsTogglingPush(true);
    try {
      const result = await registerForPushNotificationsAsync();

      if (pushState === 'enabled') {
        if (result.status === 'registered') {
          await unregisterPushToken(result.token);
        }
        setPushState('disabled');
        return;
      }

      switch (result.status) {
        case 'registered':
          await registerPushToken(result.token);
          setPushState('enabled');
          break;
        case 'permission-denied':
          setPushError(
            'Notifications permission was denied. Enable it for Queenstown Rewards in your device Settings.'
          );
          break;
        case 'unsupported-device':
          setPushError('Push notifications require a physical device.');
          break;
        case 'no-project-id':
          setPushError('Push notifications need an EAS project to be configured.');
          break;
        case 'error':
          setPushError(result.message);
          break;
      }
    } catch (error) {
      setPushError(error instanceof Error ? error.message : 'Could not update notifications.');
    } finally {
      setIsTogglingPush(false);
    }
  };

  const initials = (profile?.fullName ?? session?.user.email ?? 'Q R')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <ScreenContainer scroll>
      <AppHeader title="Profile" />

      <Card noPadding accessibilityLabel="Account" style={styles.identityCard}>
        <View style={styles.identityRow}>
          <View style={styles.avatar}>
            <ThemedText type="subtitle" style={styles.avatarText}>
              {initials}
            </ThemedText>
          </View>
          <View style={styles.identityText}>
            <ThemedText type="eyebrow" themeColor="textSecondary">
              Rewards member
            </ThemedText>
            <ThemedText type="subtitle" numberOfLines={1}>
              {profile?.fullName ?? 'Queenstown Rewards member'}
            </ThemedText>
            <ThemedText themeColor="textSecondary" numberOfLines={1}>
              {session?.user.email}
            </ThemedText>
          </View>
        </View>
      </Card>

      <Card noPadding accessibilityLabel="Account settings" style={styles.group}>
        <ProfileRow
          icon="location-outline"
          label="Preferred location"
          value={preferredLocation?.name ?? 'Choose a restaurant'}
          onPress={() => router.push('/(tabs)/locations')}
        />
        <Divider />
        <ProfileRow
          icon="time-outline"
          label="Redemption history"
          onPress={() => router.push('/(tabs)/rewards')}
        />
        <Divider />
        <ProfileRow
          icon="help-circle-outline"
          label="Help & FAQ"
          onPress={() =>
            Alert.alert(
              'Help & FAQ',
              'Support content is coming soon. Contact your local Queenstown location for now.'
            )
          }
        />
        <Divider />
        <ProfileRow
          icon="shield-checkmark-outline"
          label="Privacy policy"
          onPress={() =>
            Alert.alert('Privacy policy', 'The full privacy policy will be published here.')
          }
        />
        <Divider />
        <ProfileRow
          icon="document-text-outline"
          label="Terms and conditions"
          onPress={() =>
            Alert.alert('Terms and conditions', 'The full terms will be published here.')
          }
        />
      </Card>

      {profile && profile.role !== 'customer' && (
        <Card noPadding accessibilityLabel="Staff tools" style={styles.group}>
          <View style={styles.staffBlock}>
            <View style={styles.staffHeader}>
              <Ionicons name="qr-code-outline" size={IconSize.medium} color={Brand.primary} />
              <View style={styles.staffText}>
                <ThemedText type="smallBold">Staff tools</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Confirm customer redemptions at your location.
                </ThemedText>
              </View>
            </View>
            <Button
              label="Pending redemptions"
              variant="outline"
              onPress={() => router.push('/staff/pending-redemptions')}
            />
          </View>
        </Card>
      )}

      <Card noPadding accessibilityLabel="Notification preferences" style={styles.group}>
        <View style={styles.switchRow}>
          <View style={styles.switchTextGroup}>
            <ThemedText type="smallBold">Push notifications</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Get notified about Burger of the Month and specials.
            </ThemedText>
          </View>
          <Switch
            value={pushState === 'enabled'}
            onValueChange={handleTogglePush}
            disabled={isTogglingPush || pushState === 'checking'}
            accessibilityLabel="Push notifications"
            trackColor={{ true: Brand.primary }}
          />
        </View>
        {pushError && (
          <ThemedText type="small" style={styles.pushError}>
            {pushError}
          </ThemedText>
        )}
      </Card>

      {signOutError && (
        <Card accessibilityLabel="Sign out error">
          <ThemedText style={{ color: Brand.danger }}>{signOutError}</ThemedText>
        </Card>
      )}

      <Button
        label="Sign out"
        variant="outline"
        onPress={() => setShowSignOutConfirm(true)}
        loading={isSigningOut}
      />

      <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
        {APP_NAME} · v{Constants.expoConfig?.version ?? '1.0.0'}
      </ThemedText>

      <ConfirmationDialog
        visible={showSignOutConfirm}
        title="Sign out?"
        message="You'll need to sign back in to view your rewards."
        confirmLabel="Sign out"
        destructive
        loading={isSigningOut}
        onConfirm={handleSignOut}
        onDismiss={() => setShowSignOutConfirm(false)}
      />
    </ScreenContainer>
  );
}

function ProfileRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.profileRow, pressed && styles.rowPressed]}
    >
      <View style={styles.profileIcon}>
        <Ionicons name={icon} size={IconSize.medium} color={Brand.primary} />
      </View>
      <View style={styles.profileRowText}>
        <ThemedText style={styles.profileRowLabel}>{label}</ThemedText>
        {value && (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {value}
          </ThemedText>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Brand.primary} />
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  identityCard: {
    overflow: 'hidden',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    backgroundColor: Brand.mutedSurface,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.medium,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Brand.onPrimary,
  },
  identityText: {
    flex: 1,
    gap: 2,
  },
  group: {
    borderRadius: Radius.medium,
    overflow: 'hidden',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    minHeight: 64,
  },
  rowPressed: {
    backgroundColor: Brand.mutedSurface,
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.small,
    backgroundColor: `${Brand.primary}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileRowText: {
    flex: 1,
    gap: 2,
  },
  profileRowLabel: {
    color: Brand.charcoal,
  },
  divider: {
    height: 1,
    marginLeft: Spacing.three + 36 + Spacing.three,
    backgroundColor: `${Brand.charcoal}12`,
  },
  staffBlock: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  staffHeader: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  staffText: {
    flex: 1,
    gap: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  switchTextGroup: {
    flex: 1,
    gap: 2,
  },
  pushError: {
    color: Brand.danger,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  footer: {
    textAlign: 'center',
    paddingTop: Spacing.two,
  },
});

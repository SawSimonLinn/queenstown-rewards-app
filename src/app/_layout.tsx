import { Fraunces_500Medium, Fraunces_600SemiBold, useFonts } from '@expo-google-fonts/fraunces';
import { DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Brand, Colors } from '@/constants/theme';
import { useNotificationDeepLinks } from '@/hooks/use-notification-deep-links';
import { AuthProvider, useAuth } from '@/lib/auth';
import { MembershipProvider, useMembershipContext } from '@/lib/membership';
import { NotificationInboxProvider } from '@/lib/notification-inbox';
import '@/lib/notifications';
import { PreferredLocationProvider, usePreferredLocation } from '@/lib/preferred-location';
import { ProfileProvider, useProfileContext } from '@/lib/profile';

SplashScreen.preventAutoHideAsync();

/**
 * Safety net for the startup preloader: session/profile/preferred-location/
 * membership restoration is normally fast, but if one request hangs (dead
 * network, etc.) this forces the app open anyway after a generous timeout
 * rather than leaving the splash up forever — each dependent screen already
 * has its own retry/error UI for whichever piece didn't finish loading.
 */
const STARTUP_RECOVERY_TIMEOUT_MS = 8000;

// Queenstown Rewards is a light-only app (see AGENTS.md / redesign brief):
// the visual theme is forced to light regardless of the device's appearance
// setting, so this never branches on `useColorScheme()`.
export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Fraunces_500Medium, Fraunces_600SemiBold });

  // Keep the native splash screen up (via AnimatedSplashOverlay below) until
  // the Fraunces display font is ready — otherwise headline text flashes
  // from system font to Fraunces on first paint.
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <AuthProvider>
          <ProfileProvider>
            <NotificationInboxProvider>
              <PreferredLocationProvider>
                <MembershipProvider>
                  <RootLayoutNav />
                </MembershipProvider>
              </PreferredLocationProvider>
            </NotificationInboxProvider>
          </ProfileProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const { isLoading: isProfileLoading } = useProfileContext();
  const {
    isLoading: isPreferredLocationLoading,
    pendingLocationId,
    setPendingLocationId,
  } = usePreferredLocation();
  const { isLoading: isMembershipLoading } = useMembershipContext();
  const colors = Colors.light;
  const router = useRouter();
  useNotificationDeepLinks(router);

  const [timedOut, setTimedOut] = useState(false);
  const [hasCompletedStartup, setHasCompletedStartup] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), STARTUP_RECOVERY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  const isRestoringSession = isLoading;
  const isRestoringUserState =
    !!session && (isProfileLoading || isPreferredLocationLoading || isMembershipLoading);
  const restoredInitialState = !isRestoringSession && !isRestoringUserState;
  const isStartupReady = hasCompletedStartup || timedOut || restoredInitialState;

  useEffect(() => {
    if (!isStartupReady || hasCompletedStartup) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasCompletedStartup(true);
  }, [hasCompletedStartup, isStartupReady]);

  // A signed-out user who tapped the preferred-location star gets sent to
  // login (see PreferredLocationStar); once a session exists, return them to
  // that location so they can confirm the preference themselves — never set
  // it automatically.
  useEffect(() => {
    if (!session || isProfileLoading || isPreferredLocationLoading) return;
    if (!pendingLocationId) return;
    const locationId = pendingLocationId;
    setPendingLocationId(null);
    router.push(`/locations/${locationId}`);
  }, [
    session,
    isProfileLoading,
    isPreferredLocationLoading,
    pendingLocationId,
    setPendingLocationId,
    router,
  ]);

  if (!isStartupReady) {
    return <AnimatedSplashOverlay ready={false} />;
  }

  // No preferred-location gate here by design: a signed-in user with no
  // preferred_location_id (a perfectly normal, permanent state — nothing
  // ever picks one for them) goes straight into the app below, same as
  // anyone else. Choosing one only ever happens from the star control or
  // Account Settings.
  return (
    <>
      <AnimatedSplashOverlay ready />
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          headerTintColor: Brand.primary,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text },
          contentStyle: { backgroundColor: colors.background },
          // Without this, iOS falls back to showing the *previous* screen's
          // route name as the back button's label — since "(tabs)" has no
          // explicit title, navigating off of it renders a literal "‹
          // (tabs)" back button instead of just the chevron.
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="notifications"
            options={{ headerShown: true, headerTitle: 'Notifications' }}
          />
          <Stack.Screen
            name="burger/[id]"
            options={{ headerShown: true, headerTitle: 'Burger of the Month' }}
          />
          <Stack.Screen name="locations/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="redemption/confirm"
            options={{ headerShown: true, headerTitle: 'Before you redeem' }}
          />
          <Stack.Screen
            name="redemption/scan"
            options={{ headerShown: true, headerTitle: 'Scan to redeem' }}
          />
          <Stack.Screen
            name="redemption/review"
            options={{ headerShown: true, headerTitle: 'Review redemption' }}
          />
          <Stack.Screen
            name="staff/pending-redemptions"
            options={{ headerShown: true, headerTitle: 'Pending redemptions' }}
          />
          <Stack.Screen
            name="specials/index"
            options={{ headerShown: true, headerTitle: 'Specials' }}
          />
          <Stack.Screen
            name="specials/[id]"
            options={{ headerShown: true, headerTitle: 'Special' }}
          />
          <Stack.Screen
            name="burger-club/how-it-works"
            options={{ headerShown: true, headerTitle: 'How It Works' }}
          />
          <Stack.Screen
            name="account-settings"
            options={{ headerShown: true, headerTitle: 'Account settings' }}
          />
          <Stack.Screen
            name="edit-profile"
            options={{ headerShown: true, headerTitle: 'Edit profile' }}
          />
          <Stack.Screen
            name="preferred-location"
            options={{ headerShown: true, headerTitle: 'Preferred location' }}
          />
          <Stack.Screen
            name="change-email"
            options={{ headerShown: true, headerTitle: 'Email address' }}
          />
          <Stack.Screen
            name="change-password"
            options={{ headerShown: true, headerTitle: 'Change password' }}
          />
          <Stack.Screen
            name="burger-club/terms"
            options={{ headerShown: true, headerTitle: 'Club Terms' }}
          />
        </Stack.Protected>

        <Stack.Protected guard={!session}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        {/* Reachable regardless of auth state: a recovery deep link can arrive
          with no session yet, and establishing one mid-screen must not get
          yanked away by the guards above switching. */}
        <Stack.Screen name="reset-password" options={{ headerShown: true, headerTitle: '' }} />
        <Stack.Screen name="auth-callback" options={{ headerShown: true, headerTitle: '' }} />
      </Stack>
    </>
  );
}

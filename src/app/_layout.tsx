import {
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  useFonts,
} from '@expo-google-fonts/fraunces';
import { DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Brand, Colors } from '@/constants/theme';
import { useNotificationDeepLinks } from '@/hooks/use-notification-deep-links';
import { AuthProvider, useAuth } from '@/lib/auth';
import '@/lib/notifications';
import { PreferredLocationProvider } from '@/lib/preferred-location';
import { ProfileProvider } from '@/lib/profile';

SplashScreen.preventAutoHideAsync();

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
            <PreferredLocationProvider>
              <AnimatedSplashOverlay />
              <StatusBar style="dark" />
              <RootLayoutNav />
            </PreferredLocationProvider>
          </ProfileProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const colors = Colors.light;
  const router = useRouter();
  useNotificationDeepLinks(router);

  if (isLoading) {
    // Native splash screen (via AnimatedSplashOverlay) stays visible until
    // the persisted session check above resolves.
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTintColor: Brand.primary,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="burger/[id]"
          options={{ headerShown: true, headerTitle: 'Burger of the Month' }}
        />
        <Stack.Screen
          name="locations/[id]"
          options={{ headerShown: true, headerTitle: 'Location' }}
        />
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
    </Stack>
  );
}

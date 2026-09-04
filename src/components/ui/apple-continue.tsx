import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { signInWithApple } from '@/services/auth';
import { getMyProfile, updateMyProfile } from '@/services/profile';

type AppleContinueSectionProps = {
  /** Reported for anything worth surfacing to the user; cancellation is handled silently and never reaches this. */
  onError: (message: string) => void;
};

function randomNonce() {
  const bytes = Crypto.getRandomBytes(16);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function isUserCancellation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ERR_REQUEST_CANCELED'
  );
}

function describeAppleAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  const lower = message.toLowerCase();

  if (lower.includes('already registered') || lower.includes('already exists') || lower.includes('already linked')) {
    return 'An account with this email already exists. Sign in with your email and password instead.';
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Could not reach the server. Check your connection and try again.';
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ERR_REQUEST_NOT_HANDLED'
  ) {
    return 'Sign in with Apple isn’t available on this device right now.';
  }

  return message || 'Could not sign in with Apple. Please try again.';
}

/**
 * Captures the Apple-supplied name into the profiles table. Apple only ever
 * sends `fullName` on a user's very first authorization for this app, so
 * this naturally never runs on a returning login — but it also guards
 * against clobbering a name the person has since edited themselves.
 */
async function captureProfileNameIfMissing(fullName: string) {
  try {
    const profile = await getMyProfile();
    if (profile && !profile.fullName.trim()) {
      await updateMyProfile({ fullName });
    }
  } catch {
    // Non-fatal: the session is valid regardless, and the name can still be
    // fixed later from account settings.
  }
}

/**
 * "or continue with" divider + Apple's native button, shared by the Login
 * and Sign Up screens. Renders nothing outside iOS or when the device can't
 * present Sign in with Apple (e.g. signed out of iCloud).
 */
export function AppleContinueSection({ onError }: AppleContinueSectionProps) {
  const theme = useTheme();
  const [isAvailable, setIsAvailable] = useState(false);
  const isSigningInRef = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    AppleAuthentication.isAvailableAsync().then(setIsAvailable);
  }, []);

  if (Platform.OS !== 'ios' || !isAvailable) return null;

  const handlePress = async () => {
    if (isSigningInRef.current) return;
    isSigningInRef.current = true;
    try {
      const rawNonce = randomNonce();
      const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!credential.identityToken) {
        onError('Apple didn’t return the information needed to sign you in. Please try again.');
        return;
      }

      const fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
        .filter(Boolean)
        .join(' ')
        .trim();

      await signInWithApple(credential.identityToken, rawNonce, fullName || undefined);

      if (fullName) {
        await captureProfileNameIfMissing(fullName);
      }
      // Navigation into the app happens automatically once the auth state
      // updates — see Stack.Protected in src/app/_layout.tsx.
    } catch (error) {
      if (isUserCancellation(error)) return;
      onError(describeAppleAuthError(error));
    } finally {
      isSigningInRef.current = false;
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        <ThemedText themeColor="textMuted" type="small">
          or continue with
        </ThemedText>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
      </View>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={Radius.large}
        style={styles.button}
        onPress={handlePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.three,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  button: {
    height: 56,
    width: '100%',
  },
});

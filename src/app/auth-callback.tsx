import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Brand, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

/**
 * Generic auth deep-link callback (queenstownrewards://auth-callback) —
 * currently used for Supabase's email-change confirmation link. Kept
 * separate from reset-password.tsx, which owns the "set a new password"
 * UI specifically. Mirrors reset-password.tsx's link-parsing: Supabase can
 * hand back either a `code` query param (PKCE) or `access_token`/
 * `refresh_token` in the URL fragment (implicit flow), depending on the
 * project's auth settings.
 *
 * NOTE: `queenstownrewards://auth-callback` must be added to Supabase
 * Dashboard → Authentication → URL Configuration → Redirect URLs, or these
 * links will be rejected before they ever reach this screen.
 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const url = Linking.useURL();
  const [status, setStatus] = useState<'working' | 'success' | 'error'>('working');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      if (!url) {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage('This link is invalid or has expired. Request a new one.');
        }
        return;
      }
      try {
        const parsed = Linking.parse(url);
        const params: Record<string, string> = {};
        for (const [key, value] of Object.entries(parsed.queryParams ?? {})) {
          if (typeof value === 'string') params[key] = value;
        }
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
          new URLSearchParams(url.slice(hashIndex + 1)).forEach((value, key) => {
            params[key] = value;
          });
        }

        if (params.error || params.error_description) {
          throw new Error(
            params.error_description ?? 'This link is invalid, expired, or was cancelled.'
          );
        }

        if (params.code) {
          const { error } = await supabase.auth.exchangeCodeForSession(params.code);
          if (error) throw error;
        } else if (params.access_token && params.refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });
          if (error) throw error;
        } else {
          throw new Error('This link is invalid or has expired. Request a new one.');
        }

        if (!cancelled) setStatus('success');
      } catch (error) {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(error instanceof Error ? error.message : 'This link could not be verified.');
        }
      }
    }

    handleCallback();
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (status === 'working') {
    return (
      <ScreenContainer>
        <Card accessibilityLabel="Confirming your request">
          <ThemedText themeColor="textSecondary">Confirming your request…</ThemedText>
        </Card>
      </ScreenContainer>
    );
  }

  if (status === 'error') {
    return (
      <ScreenContainer>
        <ErrorState
          title="This link doesn't work"
          message={errorMessage ?? 'This link is invalid or has expired.'}
        />
        <Button label="Back to app" onPress={() => router.replace('/')} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.iconWrap}>
        <Ionicons name="checkmark-circle" size={40} color={Brand.success} />
      </View>
      <Card accessibilityLabel="Confirmed">
        <ThemedText type="smallBold" style={styles.center}>
          You&apos;re all set
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.center}>
          Your request has been confirmed.
        </ThemedText>
      </Card>
      <Button label="Continue to app" onPress={() => router.replace('/')} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Brand.success}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: Spacing.five,
  },
});

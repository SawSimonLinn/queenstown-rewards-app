import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { TextField } from '@/components/ui/text-field';
import { Brand, Spacing } from '@/constants/theme';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validation/auth';
import { supabase } from '@/lib/supabase';
import { updatePassword } from '@/services/auth';

/**
 * Reached via the deep link in the "reset password" email
 * (queenstownrewards://reset-password). Supabase's redirect can carry the
 * recovery credentials either as a `code` query param (PKCE flow) or as
 * `access_token`/`refresh_token` in the URL fragment (implicit flow),
 * depending on your Supabase project's auth settings — this screen handles
 * both. NOTE: `queenstownrewards://reset-password` must also be added to
 * Supabase Dashboard → Authentication → URL Configuration → Redirect URLs,
 * or the emailed link will be rejected before it ever reaches this screen.
 */
export default function ResetPasswordScreen() {
  const router = useRouter();
  const url = Linking.useURL();
  const [establishing, setEstablishing] = useState(true);
  const [establishError, setEstablishError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    let cancelled = false;

    async function establishRecoverySession() {
      if (!url) {
        if (!cancelled) setEstablishing(false);
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
          throw new Error('This reset link is invalid or has expired. Request a new one.');
        }
        if (!cancelled) setSessionReady(true);
      } catch (error) {
        if (!cancelled) {
          setEstablishError(
            error instanceof Error ? error.message : 'Could not verify this reset link.'
          );
        }
      } finally {
        if (!cancelled) setEstablishing(false);
      }
    }

    establishRecoverySession();
    return () => {
      cancelled = true;
    };
  }, [url]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setFormError(null);
    try {
      await updatePassword(values.password);
      setSuccess(true);
      // The recovery session is now a normal session — Stack.Protected in
      // src/app/_layout.tsx routes into the app automatically.
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not update your password.');
    }
  };

  if (establishing) {
    return (
      <ScreenContainer>
        <Card accessibilityLabel="Verifying reset link">
          <ThemedText themeColor="textSecondary">Verifying your reset link…</ThemedText>
        </Card>
      </ScreenContainer>
    );
  }

  if (establishError || !sessionReady) {
    return (
      <ScreenContainer>
        <ErrorState
          title="This link doesn't work"
          message={establishError ?? 'This reset link is invalid or has expired.'}
        />
      </ScreenContainer>
    );
  }

  if (success) {
    return (
      <ScreenContainer>
        <View style={styles.successIconWrap}>
          <Ionicons name="checkmark-circle" size={40} color={Brand.success} />
        </View>
        <Card accessibilityLabel="Password updated">
          <ThemedText type="smallBold" style={styles.center}>
            Password updated
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.center}>
            Your password has been updated.
          </ThemedText>
        </Card>
        <Button label="Continue to app" onPress={() => router.replace('/')} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <ThemedText type="title" style={styles.title}>
        Set a new password
      </ThemedText>

      {formError && (
        <Card accessibilityLabel="Reset password error">
          <ThemedText style={styles.errorText}>{formError}</ThemedText>
        </Card>
      )}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="New password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            passwordRules="minlength: 8;"
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Confirm new password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.confirmPassword?.message}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            passwordRules="minlength: 8;"
          />
        )}
      />

      <Button
        label="Update password"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        loadingLabel="Updating"
        size="large"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: Spacing.four,
  },
  errorText: {
    color: Brand.danger,
  },
  center: {
    textAlign: 'center',
  },
  successIconWrap: {
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

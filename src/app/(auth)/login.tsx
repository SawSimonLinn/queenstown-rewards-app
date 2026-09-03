import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScreenContainer } from '@/components/ui/screen-container';
import { TextField } from '@/components/ui/text-field';
import { Brand, IconSize, LinkHitSlop, Radius, Spacing } from '@/constants/theme';
import { loginSchema, type LoginFormValues } from '@/lib/validation/auth';
import { signInWithEmail } from '@/services/auth';

export default function LoginScreen() {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      await signInWithEmail(values.email, values.password);
      // Navigation into the app happens automatically once the auth state
      // updates — see Stack.Protected in src/app/_layout.tsx.
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not sign in.');
    }
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.wordmarkGroup}>
        <View style={styles.wordmarkBadge}>
          <Ionicons name="fast-food" size={IconSize.large} color={Brand.onPrimary} />
        </View>
        <ThemedText type="display" style={styles.wordmark}>
          Queenstown
        </ThemedText>
        <ThemedText type="eyebrow">Rewards</ThemedText>
      </View>
      <ThemedText themeColor="textSecondary" style={styles.tagline}>
        Sign in to track your Burger of the Month and redeem your rewards.
      </ThemedText>

      {formError && (
        <Card accessibilityLabel="Sign in error">
          <ThemedText style={styles.errorText}>{formError}</ThemedText>
        </Card>
      )}

      <View style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="username"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
            />
          )}
        />

        <Link href="/(auth)/forgot-password" asChild>
          <Pressable accessibilityRole="link" hitSlop={LinkHitSlop}>
            <ThemedText type="linkPrimary">Forgot your password?</ThemedText>
          </Pressable>
        </Link>

        <Button
          label="Sign in"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          size="large"
        />
      </View>

      <Link href="/(auth)/register" asChild>
        <Pressable accessibilityRole="link" hitSlop={LinkHitSlop}>
          <ThemedText type="linkPrimary" style={styles.center}>
            Don&apos;t have an account? Create one
          </ThemedText>
        </Pressable>
      </Link>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wordmarkGroup: {
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: Spacing.five,
  },
  wordmarkBadge: {
    width: 56,
    height: 56,
    borderRadius: Radius.large,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  wordmark: {
    letterSpacing: 0,
  },
  tagline: {
    textAlign: 'center',
    paddingHorizontal: Spacing.three,
  },
  form: {
    gap: Spacing.three,
  },
  center: {
    textAlign: 'center',
  },
  errorText: {
    color: Brand.danger,
  },
});

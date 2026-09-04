import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppleContinueSection } from '@/components/ui/apple-continue';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScreenContainer } from '@/components/ui/screen-container';
import { TextField } from '@/components/ui/text-field';
import { Brand, LinkHitSlop, Spacing } from '@/constants/theme';
import { registerSchema, type RegisterFormValues } from '@/lib/validation/auth';
import { registerWithEmail } from '@/services/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);
    try {
      const data = await registerWithEmail(values.fullName, values.email, values.password);
      if (!data.session) {
        // Email confirmation is required before a session is issued.
        setNeedsEmailConfirmation(true);
      }
      // If a session WAS returned (confirmation disabled on this project),
      // Stack.Protected routes into the app automatically.
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not create your account.');
    }
  };

  if (needsEmailConfirmation) {
    return (
      <ScreenContainer scroll>
        <View style={styles.confirmIconWrap}>
          <Ionicons name="mail-open-outline" size={32} color={Brand.primary} />
        </View>
        <ThemedText type="title" style={styles.center}>
          Check your email
        </ThemedText>
        <Card accessibilityLabel="Verify your email">
          <ThemedText themeColor="textSecondary" style={styles.center}>
            We&apos;ve sent a verification link to your email address. Confirm it, then sign in.
          </ThemedText>
        </Card>
        <Button label="Back to sign in" onPress={() => router.replace('/(auth)/login')} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <ThemedText type="title" style={styles.title}>
        Create account
      </ThemedText>
      <ThemedText themeColor="textSecondary">
        Join Queenstown Rewards to unlock a free Burger of the Month, every month.
      </ThemedText>

      {formError && (
        <Card accessibilityLabel="Registration error">
          <ThemedText style={styles.errorText}>{formError}</ThemedText>
        </Card>
      )}

      <View style={styles.form}>
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Full name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.fullName?.message}
              autoComplete="name"
              textContentType="name"
            />
          )}
        />

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
              hint="At least 8 characters."
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
              label="Confirm password"
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
          label="Create account"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          loadingLabel="Creating account"
          size="large"
        />
      </View>

      <AppleContinueSection onError={setFormError} />

      <Link href="/(auth)/login" asChild>
        <Pressable accessibilityRole="link" hitSlop={LinkHitSlop}>
          <ThemedText type="linkPrimary" style={styles.center}>
            Already have an account? Sign in
          </ThemedText>
        </Pressable>
      </Link>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: Spacing.four,
  },
  confirmIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Brand.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: Spacing.five,
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

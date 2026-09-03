import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScreenContainer } from '@/components/ui/screen-container';
import { TextField } from '@/components/ui/text-field';
import { Brand, LinkHitSlop, Spacing } from '@/constants/theme';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/validation/auth';
import { requestPasswordReset } from '@/services/auth';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setFormError(null);
    try {
      await requestPasswordReset(values.email);
      setSent(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not send reset email.');
    }
  };

  if (sent) {
    return (
      <ScreenContainer scroll>
        <View style={styles.iconWrap}>
          <Ionicons name="mail-open-outline" size={32} color={Brand.primary} />
        </View>
        <ThemedText type="title" style={styles.center}>
          Check your email
        </ThemedText>
        <Card accessibilityLabel="Reset link sent">
          <ThemedText themeColor="textSecondary" style={styles.center}>
            If an account exists for that email, we&apos;ve sent a link to reset your password.
          </ThemedText>
        </Card>
        <Button label="Back to sign in" onPress={() => router.replace('/(auth)/login')} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <ThemedText type="title" style={styles.title}>
        Reset password
      </ThemedText>
      <ThemedText themeColor="textSecondary">
        Enter your email and we&apos;ll send you a link to reset your password.
      </ThemedText>

      {formError && (
        <Card accessibilityLabel="Reset password error">
          <ThemedText style={styles.errorText}>{formError}</ThemedText>
        </Card>
      )}

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
            textContentType="emailAddress"
          />
        )}
      />

      <Button
        label="Send reset link"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        size="large"
      />

      <Link href="/(auth)/login" asChild>
        <Pressable accessibilityRole="link" hitSlop={LinkHitSlop}>
          <ThemedText type="linkPrimary" style={styles.center}>
            Back to sign in
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
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Brand.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: Spacing.five,
  },
  center: {
    textAlign: 'center',
  },
  errorText: {
    color: Brand.danger,
  },
});

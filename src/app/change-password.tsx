import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScreenContainer } from '@/components/ui/screen-container';
import { TextField } from '@/components/ui/text-field';
import { Brand } from '@/constants/theme';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validation/auth';
import { updatePassword } from '@/services/auth';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setFormError(null);
    try {
      await updatePassword(values.password);
      Alert.alert('Password updated', 'Your password has been changed.');
      router.back();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not update your password.');
    }
  };

  return (
    <ScreenContainer scroll>
      {formError && (
        <Card accessibilityLabel="Change password error">
          <ThemedText style={{ color: Brand.danger }}>{formError}</ThemedText>
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
        disabled={isSubmitting}
        size="large"
      />
    </ScreenContainer>
  );
}

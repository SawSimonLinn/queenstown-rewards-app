import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScreenContainer } from '@/components/ui/screen-container';
import { TextField } from '@/components/ui/text-field';
import { Brand, Spacing } from '@/constants/theme';
import { useBrand } from '@/hooks/use-brand';
import { useAuth } from '@/lib/auth';
import { createChangeEmailSchema, type ChangeEmailFormValues } from '@/lib/validation/profile';
import { updateEmail } from '@/services/auth';

export default function ChangeEmailScreen() {
  const router = useRouter();
  const brand = useBrand();
  const { session } = useAuth();
  const currentEmail = session?.user.email ?? '';
  const [formError, setFormError] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);

  const schema = useMemo(() => createChangeEmailSchema(currentEmail), [currentEmail]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newEmail: '', confirmNewEmail: '' },
  });

  const onSubmit = async (values: ChangeEmailFormValues) => {
    setFormError(null);
    try {
      await updateEmail(values.newEmail.trim());
      setRequested(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not request that email change.');
    }
  };

  if (requested) {
    return (
      <ScreenContainer>
        <View style={[styles.iconWrap, { backgroundColor: `${brand.primary}1A` }]}>
          <Ionicons name="mail-open-outline" size={32} color={brand.primary} />
        </View>
        <ThemedText type="title" style={styles.center}>
          Check your email
        </ThemedText>
        <Card accessibilityLabel="Confirm your new email">
          <ThemedText themeColor="textSecondary" style={styles.center}>
            We sent a confirmation link to your new email address. Your email will change after you
            confirm it. If your project requires confirming both addresses, check your current inbox
            too — both links must be confirmed.
          </ThemedText>
        </Card>
        <Button label="Back to account settings" onPress={() => router.back()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <TextField label="Current email" value={currentEmail} editable={false} />

      {formError && (
        <Card accessibilityLabel="Change email error">
          <ThemedText style={{ color: Brand.danger }}>{formError}</ThemedText>
        </Card>
      )}

      <Controller
        control={control}
        name="newEmail"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="New email address"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.newEmail?.message}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="username"
          />
        )}
      />

      <Controller
        control={control}
        name="confirmNewEmail"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Confirm new email address"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.confirmNewEmail?.message}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="username"
          />
        )}
      />

      <Button
        label="Update email"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        loadingLabel="Updating"
        disabled={isSubmitting}
        size="large"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
});

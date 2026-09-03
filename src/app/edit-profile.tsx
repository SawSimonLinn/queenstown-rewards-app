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
import { editProfileSchema, type EditProfileFormValues } from '@/lib/validation/profile';
import { useProfileContext } from '@/lib/profile';
import { updateMyProfile } from '@/services/profile';

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, refetch } = useProfileContext();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { fullName: profile?.fullName ?? '' },
  });

  const onSubmit = async (values: EditProfileFormValues) => {
    if (!profile || values.fullName.trim() === profile.fullName.trim()) return;
    setFormError(null);
    try {
      await updateMyProfile({ fullName: values.fullName.trim() });
      refetch();
      Alert.alert('Profile updated', 'Your changes have been saved.');
      router.back();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save your changes.');
    }
  };

  if (!profile) {
    return <ScreenContainer />;
  }

  return (
    <ScreenContainer scroll>
      {formError && (
        <Card accessibilityLabel="Edit profile error">
          <ThemedText style={{ color: Brand.danger }}>{formError}</ThemedText>
        </Card>
      )}

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

      <Button
        label="Save changes"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        loadingLabel="Saving"
        disabled={!isDirty || isSubmitting}
        size="large"
      />
    </ScreenContainer>
  );
}

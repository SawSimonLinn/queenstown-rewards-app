import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { ScreenContainer } from '@/components/ui/screen-container';
import { CardSkeleton } from '@/components/ui/skeleton';
import { TextField } from '@/components/ui/text-field';
import { Brand, IconSize, Spacing } from '@/constants/theme';
import { QUEENSTOWN_LOCATIONS } from '@/data/locations';
import { specialSchema, type SpecialFormValues } from '@/lib/validation/special';
import { getSupabaseLocationId, getSlugForSupabaseLocationId } from '@/services/locations';
import {
  createSpecial,
  getSpecialDetail,
  replaceSpecialLocations,
  updateSpecial,
} from '@/services/specials';

function toDateOnly(iso: string): string {
  return iso.slice(0, 10);
}

export default function SpecialFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const isEditing = !!id;
  const [isLoadingExisting, setIsLoadingExisting] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SpecialFormValues>({
    resolver: zodResolver(specialSchema),
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
      startDate: '',
      endDate: '',
      locationIds: [],
    },
  });

  const selectedLocationIds = watch('locationIds');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        const detail = await getSpecialDetail(id);
        if (!detail || cancelled) return;
        const slugs = await Promise.all(
          detail.locations.map((location) => getSlugForSupabaseLocationId(location.id))
        );
        if (cancelled) return;
        setValue('title', detail.special.title);
        setValue('description', detail.special.description);
        setValue('imageUrl', detail.special.imageUrl ?? '');
        setValue('startDate', toDateOnly(detail.special.startDate));
        setValue('endDate', toDateOnly(detail.special.endDate));
        setValue('locationIds', slugs.filter((slug): slug is string => slug !== null));
      } catch {
        if (!cancelled) setLoadError("Couldn't load this special. Try again.");
      } finally {
        if (!cancelled) setIsLoadingExisting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, setValue]);

  const toggleLocation = (slug: string) => {
    const next = selectedLocationIds.includes(slug)
      ? selectedLocationIds.filter((value) => value !== slug)
      : [...selectedLocationIds, slug];
    setValue('locationIds', next);
  };

  const onSubmit = async (values: SpecialFormValues) => {
    setFormError(null);
    try {
      const input = {
        title: values.title,
        description: values.description,
        imageUrl: values.imageUrl ? values.imageUrl : null,
        startDate: values.startDate,
        endDate: values.endDate,
      };
      const special = isEditing && id ? await updateSpecial(id, input) : await createSpecial(input);

      const supabaseLocationIds = (
        await Promise.all(values.locationIds.map(getSupabaseLocationId))
      ).filter((value): value is string => value !== null);
      await replaceSpecialLocations(special.id, supabaseLocationIds);

      router.back();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save this special.');
    }
  };

  if (isLoadingExisting) {
    return (
      <ScreenContainer scroll>
        <CardSkeleton />
      </ScreenContainer>
    );
  }

  if (loadError) {
    return (
      <ScreenContainer>
        <ErrorState message={loadError} onRetry={() => router.back()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <ThemedText type="title">{isEditing ? 'Edit special' : 'New special'}</ThemedText>

      {formError && (
        <Card accessibilityLabel="Save error">
          <ThemedText style={styles.errorText}>{formError}</ThemedText>
        </Card>
      )}

      <View style={styles.form}>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Title"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.title?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Description"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.description?.message}
              multiline
            />
          )}
        />

        <Controller
          control={control}
          name="imageUrl"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Image URL (optional)"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.imageUrl?.message}
              autoCapitalize="none"
              keyboardType="url"
            />
          )}
        />

        <Controller
          control={control}
          name="startDate"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Start date"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.startDate?.message}
              hint="YYYY-MM-DD"
              placeholder="2026-09-01"
            />
          )}
        />

        <Controller
          control={control}
          name="endDate"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="End date"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.endDate?.message}
              hint="YYYY-MM-DD"
              placeholder="2026-09-30"
            />
          )}
        />

        <View style={styles.locationsGroup}>
          <ThemedText type="smallBold">Locations</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            None selected means available at every participating location.
          </ThemedText>
          {QUEENSTOWN_LOCATIONS.map((location) => {
            const selected = selectedLocationIds.includes(location.id);
            return (
              <Pressable
                key={location.id}
                onPress={() => toggleLocation(location.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                style={styles.locationRow}
              >
                <Ionicons
                  name={selected ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={selected ? Brand.primary : Brand.charcoal}
                />
                <ThemedText style={styles.locationLabel}>{location.name}</ThemedText>
              </Pressable>
            );
          })}
        </View>

        <Button
          label={isEditing ? 'Save changes' : 'Create special'}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          loadingLabel="Saving"
          size="large"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
  errorText: {
    color: Brand.danger,
  },
  locationsGroup: {
    gap: Spacing.one,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: IconSize.xlarge,
  },
  locationLabel: {
    flex: 1,
  },
});

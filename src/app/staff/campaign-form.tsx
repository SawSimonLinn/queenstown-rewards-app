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
import { Brand, IconSize, Radius, Spacing } from '@/constants/theme';
import { useBrand } from '@/hooks/use-brand';
import { useTheme } from '@/hooks/use-theme';
import { QUEENSTOWN_LOCATIONS } from '@/data/locations';
import {
  CAMPAIGN_STATUS_OPTIONS,
  campaignSchema,
  type CampaignFormValues,
} from '@/lib/validation/campaign';
import { getSupabaseLocationId, getSlugForSupabaseLocationId } from '@/services/locations';
import {
  createCampaign,
  getCampaignForStaff,
  replaceCampaignLocations,
  updateCampaign,
} from '@/services/burger';

function toDateOnly(iso: string): string {
  return iso.slice(0, 10);
}

export default function CampaignFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const brand = useBrand();
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
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
      termsAndRestrictions: '',
      startDate: '',
      endDate: '',
      status: 'draft',
      locationIds: [],
    },
  });

  const selectedLocationIds = watch('locationIds');
  const status = watch('status');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        const detail = await getCampaignForStaff(id);
        if (!detail || cancelled) return;
        const slugs = await Promise.all(
          detail.participatingLocations.map((location) =>
            getSlugForSupabaseLocationId(location.id)
          )
        );
        if (cancelled) return;
        setValue('name', detail.campaign.name);
        setValue('description', detail.campaign.description);
        setValue('imageUrl', detail.campaign.imageUrl ?? '');
        setValue('termsAndRestrictions', detail.campaign.termsAndRestrictions);
        setValue('startDate', toDateOnly(detail.campaign.startDate));
        setValue('endDate', toDateOnly(detail.campaign.endDate));
        setValue('status', detail.campaign.status);
        setValue('locationIds', slugs.filter((slug): slug is string => slug !== null));
      } catch {
        if (!cancelled) setLoadError("Couldn't load this campaign. Try again.");
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

  const onSubmit = async (values: CampaignFormValues) => {
    setFormError(null);
    try {
      const input = {
        name: values.name,
        description: values.description,
        imageUrl: values.imageUrl ? values.imageUrl : null,
        termsAndRestrictions: values.termsAndRestrictions,
        startDate: values.startDate,
        endDate: values.endDate,
        status: values.status,
      };
      const campaign =
        isEditing && id ? await updateCampaign(id, input) : await createCampaign(input);

      const supabaseLocationIds = (
        await Promise.all(values.locationIds.map(getSupabaseLocationId))
      ).filter((value): value is string => value !== null);
      await replaceCampaignLocations(campaign.id, supabaseLocationIds);

      router.back();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save this campaign.');
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
      <ThemedText type="title">{isEditing ? 'Edit campaign' : 'New campaign'}</ThemedText>

      {formError && (
        <Card accessibilityLabel="Save error">
          <ThemedText style={styles.errorText}>{formError}</ThemedText>
        </Card>
      )}

      <View style={styles.form}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
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
          name="termsAndRestrictions"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Terms and restrictions"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.termsAndRestrictions?.message}
              multiline
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

        <View style={styles.statusGroup}>
          <ThemedText type="smallBold">Status</ThemedText>
          <View style={styles.statusRow}>
            {CAMPAIGN_STATUS_OPTIONS.map((option) => {
              const active = status === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setValue('status', option)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.statusChip,
                    { borderColor: theme.border },
                    active && [
                      styles.statusChipActive,
                      { backgroundColor: brand.primary, borderColor: brand.primary },
                    ],
                  ]}
                >
                  <ThemedText
                    type="smallBold"
                    style={
                      active
                        ? [styles.statusLabelActive, { color: brand.onPrimary }]
                        : { color: theme.textSecondary }
                    }
                  >
                    {option[0].toUpperCase() + option.slice(1)}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.locationsGroup}>
          <ThemedText type="smallBold">Participating locations</ThemedText>
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
                  color={selected ? brand.primary : Brand.charcoal}
                />
                <ThemedText style={styles.locationLabel}>{location.name}</ThemedText>
              </Pressable>
            );
          })}
        </View>

        <Button
          label={isEditing ? 'Save changes' : 'Create campaign'}
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
  statusGroup: {
    gap: Spacing.two,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  statusChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  statusChipActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  statusLabelActive: {
    color: Brand.onPrimary,
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

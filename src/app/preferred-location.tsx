import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { LocationSelector } from '@/components/locations/location-selector';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Brand, Spacing } from '@/constants/theme';
import type { RestaurantLocation } from '@/data/types';
import { getErrorMessage } from '@/lib/errors';
import { usePreferredLocation } from '@/lib/preferred-location';

export default function PreferredLocationScreen() {
  const router = useRouter();
  const { preferredLocation, savePreferredLocation, clearPreferredLocation } =
    usePreferredLocation();
  const [isClearing, setIsClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);

  const handleSave = async (location: RestaurantLocation) => {
    await savePreferredLocation(location);
    // Failures throw from savePreferredLocation and are shown inline by
    // LocationSelector, leaving the previous preference untouched — only a
    // confirmed Supabase write reaches this point.
    Alert.alert('Location updated', `${location.name} is now your preferred location.`);
    router.back();
  };

  const handleClear = () => {
    Alert.alert(
      'Clear preferred location?',
      "You won't see a single restaurant highlighted on Home until you choose a new one. This doesn't affect your Burger Club membership or redemption history.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setClearError(null);
            setIsClearing(true);
            try {
              await clearPreferredLocation();
              router.back();
            } catch (error) {
              setClearError(getErrorMessage(error, "Couldn't clear your location. Try again."));
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <LocationSelector
        title="Preferred location"
        message="Choose the Queenstown location you'd like to see specials, hours, and Burger of the Month information for. This is entirely optional."
        initialSelectedId={preferredLocation?.id ?? null}
        onSave={handleSave}
      />

      {preferredLocation && (
        <>
          <Button
            label="Clear preferred location"
            variant="ghost"
            onPress={handleClear}
            loading={isClearing}
            loadingLabel="Clearing"
          />
          {clearError && <ThemedText style={styles.errorText}>{clearError}</ThemedText>}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: Brand.danger,
    marginTop: -Spacing.two,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Brand, IconSize, Radius, Spacing } from '@/constants/theme';
import { usePreferredLocation } from '@/lib/preferred-location';

export default function ScanScreen() {
  const router = useRouter();
  const { preferredLocation } = usePreferredLocation();
  const [permission, requestPermission] = useCameraPermissions();
  // Prevents a single QR code from firing onBarcodeScanned repeatedly while
  // it stays in frame across camera frames.
  const hasScannedRef = useRef(false);

  if (!preferredLocation) {
    return (
      <ScreenContainer>
        <Card accessibilityLabel="Choose a location first">
          <View style={styles.introIconWrap}>
            <Ionicons name="location-outline" size={IconSize.xlarge} color={Brand.primary} />
          </View>
          <ThemedText type="smallBold">Choose a location first</ThemedText>
          <ThemedText themeColor="textSecondary">
            Select the Queenstown location you&apos;re redeeming at before scanning a QR code.
          </ThemedText>
          <Button label="Go to Locations" onPress={() => router.push('/(tabs)/locations')} />
        </Card>
      </ScreenContainer>
    );
  }

  if (!permission) {
    return <ScreenContainer />;
  }

  if (!permission.granted) {
    return (
      <ScreenContainer>
        <Card accessibilityLabel="Camera access needed">
          <View style={styles.introIconWrap}>
            <Ionicons name="camera-outline" size={IconSize.xlarge} color={Brand.primary} />
          </View>
          <ThemedText type="smallBold">Camera access needed</ThemedText>
          <ThemedText themeColor="textSecondary">
            Queenstown Rewards needs your camera to scan the redemption QR code at{' '}
            {preferredLocation.name}. This is only used to scan redemption codes at participating
            locations.
          </ThemedText>
          {permission.canAskAgain ? (
            <Button label="Grant camera access" onPress={requestPermission} />
          ) : (
            <Button
              label="Open Settings"
              onPress={() => Linking.openSettings()}
              accessibilityLabel="Open device settings to enable camera access"
            />
          )}
        </Card>
        <Button label="Cancel" variant="outline" onPress={() => router.back()} />
      </ScreenContainer>
    );
  }

  return (
    <View style={styles.flex}>
      <CameraView
        style={styles.flex}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={({ data }) => {
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;
          router.replace({
            pathname: '/redemption/review',
            params: { token: data, locationId: preferredLocation.id },
          });
        }}
      />
      <View pointerEvents="box-none" style={styles.overlay}>
        <View style={styles.frameWrap}>
          <View
            style={styles.frame}
            accessibilityLabel="Point your camera at the redemption QR code"
          />
          {(['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const).map((corner) => (
            <View key={corner} style={[styles.corner, cornerStyles[corner]]} />
          ))}
        </View>
        <ThemedText style={styles.instructions}>
          Point your camera at the redemption QR code at {preferredLocation.name}
        </ThemedText>
        <Button label="Cancel" variant="outline" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const CORNER_SIZE = 28;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  introIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Brand.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    padding: Spacing.four,
  },
  frameWrap: {
    width: 240,
    height: 240,
  },
  frame: {
    ...StyleSheet.absoluteFill,
    borderRadius: Radius.large,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: Brand.primary,
  },
  instructions: {
    color: Brand.onPrimary,
    textAlign: 'center',
    backgroundColor: 'rgba(20,14,10,0.55)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.medium,
  },
});

const cornerStyles = StyleSheet.create({
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: Radius.large,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: Radius.large,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: Radius.large,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: Radius.large,
  },
});

import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';

/**
 * The bottom tab bar's own content height, i.e. excluding the device's
 * safe-area inset (home indicator on iOS, gesture/button nav on Android).
 * That inset is added separately via `useSafeAreaInsets()` below, since it
 * varies per device (0 on a Home-button iPhone, 34 on a Face ID iPhone,
 * varies again on Android) and must never be baked into a flat constant.
 */
export const TAB_BAR_CONTENT_HEIGHT = Platform.select({ ios: 49, android: 64, default: 49 });

/**
 * Bottom padding so a screen's content can scroll fully clear of the bottom
 * tab bar, on any device with or without a home indicator / gesture bar.
 * Use this instead of a hardcoded margin on individual screens — apply it to
 * a ScrollView's contentContainerStyle (or a non-scrolling screen's own
 * bottom padding) via `ScreenContainer`.
 */
export function useTabBarBottomPadding(extra: number = Spacing.three) {
  const insets = useSafeAreaInsets();
  return insets.bottom + TAB_BAR_CONTENT_HEIGHT + extra;
}

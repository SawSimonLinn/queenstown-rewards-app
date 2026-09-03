/**
 * Below are the colors that are used in the app.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

/**
 * Temporary Queenstown Rewards brand palette — bright, energetic light theme
 * (white + warm off-white surfaces, orange-red primary, golden-orange
 * accent). These are placeholder values; replace with the official
 * Queenstown brand kit once supplied (search this file and `Brand` below for
 * every value to swap).
 *
 * The app is light-only by design (see AGENTS.md / the redesign brief) — it
 * must never switch to a dark palette based on the device's appearance
 * setting. `dark` is kept identical to `light` (rather than removed) purely
 * so any code path that still branches on color scheme renders correctly.
 */
const light = {
  text: '#171717',
  textSecondary: '#686868',
  textMuted: '#929292',
  background: '#FAFAF8',
  backgroundElement: '#FFFFFF',
  backgroundSelected: '#FFE2D7',
  surfaceSunken: '#FFF4EE',
  border: '#E9E6E2',
} as const;

export const Colors = {
  light,
  dark: light,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Brand = {
  primary: '#ED3D16',
  primaryDark: '#CA2D0D',
  primaryTint: '#FFE2D7',
  secondary: '#FF9D1C',
  secondaryDark: '#D88100',
  onPrimary: '#FFFFFF',
  onSecondary: '#171717',
  success: '#27894A',
  danger: '#C9342C',
  warning: '#D88100',
  cream: '#FAFAF8',
  charcoal: '#171717',
  mutedSurface: '#F1EFEC',
} as const;

export const Radius = {
  small: 8,
  medium: 12,
  large: 18,
  xlarge: 24,
  pill: 999,
} as const;

/** Minimum touch target size (iOS HIG / Android accessibility guidance). */
export const MinTouchTarget = 44;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/**
 * Editorial display typeface (Fraunces, via `@expo-google-fonts/fraunces`) —
 * reserved for campaign headlines and other "meaningful promotional
 * moments" per the redesign brief. Everything else (nav, body, labels)
 * stays on the system font above so Dynamic Type / accessibility scaling
 * is unaffected. Loaded once in `src/app/_layout.tsx` via `useFonts`; on
 * web the family is declared directly (no async load needed).
 *
 * RN bakes weight into the family name for custom fonts, so `ThemedText`
 * styles using these must not also set `fontWeight`.
 */
export const DisplayFonts = Platform.select({
  web: {
    medium: "'Fraunces', Georgia, serif",
    semibold: "'Fraunces', Georgia, serif",
  },
  default: {
    medium: 'Fraunces_500Medium',
    semibold: 'Fraunces_600SemiBold',
  },
}) as { medium: string; semibold: string };

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 800;

/**
 * Reusable elevation levels. Soft, warm-charcoal shadows at low opacity —
 * bright-app "floating" cards, never a heavy/dark look.
 */
export const Shadows = {
  none: {},
  card: Platform.select({
    ios: {
      shadowColor: '#171717',
      shadowOpacity: 0.045,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 2 },
    default: {},
  }),
  raised: Platform.select({
    ios: {
      shadowColor: '#171717',
      shadowOpacity: 0.08,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 5 },
    default: {},
  }),
} as const;

export const IconSize = {
  small: 16,
  medium: 20,
  large: 24,
  xlarge: 32,
  hero: 48,
} as const;

/**
 * Expands the tappable area of small text links (e.g. "Forgot password?")
 * to help meet the ~44pt minimum touch target without changing their
 * compact visual size.
 */
export const LinkHitSlop = { top: 12, bottom: 12, left: 12, right: 12 } as const;

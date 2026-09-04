import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { DisplayFonts, Fonts, ThemeColor } from '@/constants/theme';
import { useBrand } from '@/hooks/use-brand';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'display'
    | 'editorial'
    | 'title'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'eyebrow'
    | 'link'
    | 'linkPrimary'
    | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const brand = useBrand();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'display' && styles.display,
        type === 'editorial' && styles.editorial,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'eyebrow' && [styles.eyebrow, { color: theme.textSecondary }],
        type === 'link' && styles.link,
        type === 'linkPrimary' && [styles.linkPrimary, { color: brand.primary }],
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  display: {
    fontFamily: DisplayFonts.semibold,
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -0.4,
  },
  editorial: {
    fontFamily: DisplayFonts.medium,
    fontSize: 22,
    lineHeight: 27,
    letterSpacing: -0.2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 0,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  link: {
    lineHeight: 22,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 22,
    fontSize: 14,
    fontWeight: '700',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: '700' }) ?? '500',
    fontSize: 12,
  },
});

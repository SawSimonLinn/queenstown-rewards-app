import { Image, type ImageProps } from 'expo-image';
import { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import {
  FoodImagePlaceholder,
  type FoodImagePlaceholderProps,
} from '@/components/ui/food-image-placeholder';
import { Skeleton } from '@/components/ui/skeleton';
import { Brand, Radius } from '@/constants/theme';

export type FadingImageProps = Omit<
  ImageProps,
  | 'cachePolicy'
  | 'contentFit'
  | 'placeholder'
  | 'placeholderContentFit'
  | 'source'
  | 'style'
  | 'transition'
> & {
  source?: ImageProps['source'];
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageProps['contentFit'];
  transition?: number;
  cachePolicy?: ImageProps['cachePolicy'];
  fallbackIcon?: FoodImagePlaceholderProps['icon'];
  fallbackLabel?: string;
  fallbackTone?: FoodImagePlaceholderProps['tone'];
  fallbackSize?: FoodImagePlaceholderProps['size'];
};

export function FadingImage({
  source,
  width = '100%',
  height = 200,
  radius = Radius.large,
  style,
  contentFit = 'cover',
  transition = 180,
  cachePolicy = 'memory-disk',
  fallbackIcon = 'image-outline',
  fallbackLabel,
  fallbackTone = 'warm',
  fallbackSize = 'large',
  onError,
  ...imageProps
}: FadingImageProps) {
  const reduceMotion = useReducedMotion();
  const [failedSourceKey, setFailedSourceKey] = useState<string | null>(null);
  const sourceKey = useMemo(() => getSourceKey(source), [source]);
  const hasSource = !!source && failedSourceKey !== sourceKey;

  if (!hasSource) {
    return (
      <FoodImagePlaceholder
        icon={fallbackIcon}
        height={height}
        width={width}
        radius={radius}
        label={fallbackLabel}
        tone={fallbackTone}
        size={fallbackSize}
        style={style}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: Brand.mutedSurface,
        },
        style,
      ]}
    >
      <Skeleton width="100%" height="100%" radius={0} style={StyleSheet.absoluteFill} />
      <Image
        source={source}
        contentFit={contentFit}
        placeholderContentFit={contentFit}
        cachePolicy={cachePolicy}
        transition={reduceMotion ? 0 : transition}
        recyclingKey={sourceKey}
        style={StyleSheet.absoluteFill}
        onError={(event) => {
          setFailedSourceKey(sourceKey);
          onError?.(event);
        }}
        {...imageProps}
      />
    </View>
  );
}

function getSourceKey(source: ImageProps['source']): string {
  if (!source) return 'empty';
  if (typeof source === 'string' || typeof source === 'number') return String(source);
  if (Array.isArray(source)) return source.map(getSourceKey).join('|');
  if ('uri' in source && source.uri) return source.uri;
  return JSON.stringify(source);
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

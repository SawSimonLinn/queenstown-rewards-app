import type { PropsWithChildren } from 'react';
import { type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  useReducedMotion,
} from 'react-native-reanimated';

export const MotionDuration = {
  fast: 150,
  standard: 220,
  slow: 300,
} as const;

export type FadeInViewProps = PropsWithChildren<
  ViewProps & {
    style?: StyleProp<ViewStyle>;
    duration?: number;
    slide?: boolean;
    layout?: boolean;
  }
>;

export function FadeInView({
  children,
  duration = MotionDuration.standard,
  slide = false,
  layout = false,
  style,
  ...rest
}: FadeInViewProps) {
  const reduceMotion = useReducedMotion();
  const reducedDuration = Math.min(duration, 120);
  const entering =
    slide && !reduceMotion
      ? FadeInDown.duration(duration)
      : FadeIn.duration(reduceMotion ? reducedDuration : duration);
  const exiting = FadeOut.duration(reduceMotion ? reducedDuration : MotionDuration.fast);
  const layoutAnimation =
    layout && !reduceMotion ? LinearTransition.duration(MotionDuration.standard) : undefined;

  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      layout={layoutAnimation}
      style={style}
      {...rest}
    >
      {children}
    </Animated.View>
  );
}

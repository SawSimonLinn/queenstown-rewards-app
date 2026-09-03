import { StyleSheet, View, type ColorValue } from 'react-native';

export type OrganicEdgeProps = {
  /** Color of the curved shape (usually matches the surface below/above it). */
  color: ColorValue;
  /** Height of the curved band. */
  height?: number;
  /** Flip so the bulge reads as a hill dipping the other way. */
  flip?: boolean;
};

/**
 * A single reusable soft, asymmetric curve — two overlapping circles clipped
 * to a band — standing in for a lake/hill silhouette. This is the app's one
 * recurring organic shape motif (used sparingly: hero base, Burger Club
 * emblem backdrop, pass divider) rather than scattering different blobs
 * around the UI.
 */
export function OrganicEdge({ color, height = 28, flip = false }: OrganicEdgeProps) {
  return (
    <View
      style={[styles.container, { height }, flip && styles.flipped]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View
        style={[
          styles.hill,
          {
            backgroundColor: color,
            width: height * 3.4,
            height: height * 3.4,
            borderRadius: height * 1.7,
            left: '-8%',
            bottom: -height * 2.15,
          },
        ]}
      />
      <View
        style={[
          styles.hill,
          {
            backgroundColor: color,
            width: height * 4.6,
            height: height * 4.6,
            borderRadius: height * 2.3,
            right: '-14%',
            bottom: -height * 3.35,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  flipped: {
    transform: [{ scaleY: -1 }],
  },
  hill: {
    position: 'absolute',
  },
});

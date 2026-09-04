import { RefreshControl, ScrollView, StyleSheet, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useBrand } from '@/hooks/use-brand';
import { useTabBarBottomPadding } from '@/hooks/use-tab-bar-bottom-padding';

export type ScreenContainerProps = ViewProps & {
  scroll?: boolean;
  /** Pull-to-refresh handler. Only applies when `scroll` is true. */
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;
  /** Removes the default horizontal padding — for edge-to-edge hero content. */
  edgeToEdge?: boolean;
};

export function ScreenContainer({
  style,
  scroll = false,
  onRefresh,
  refreshing = false,
  edgeToEdge = false,
  children,
  ...rest
}: ScreenContainerProps) {
  const tabBarBottomPadding = useTabBarBottomPadding();
  const brand = useBrand();

  const content = (
    <ThemedView
      style={[
        styles.content,
        !edgeToEdge && styles.padded,
        { paddingBottom: tabBarBottomPadding },
        style,
      ]}
      {...rest}
    >
      {children}
    </ThemedView>
  );

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={brand.primary}
                  colors={[brand.primary]}
                />
              ) : undefined
            }
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  padded: {
    paddingHorizontal: Spacing.four,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

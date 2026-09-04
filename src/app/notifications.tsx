import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { NotificationRow } from '@/components/notifications/notification-row';
import { ThemedText } from '@/components/themed-text';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { InlineFeedback } from '@/components/ui/inline-feedback';
import { FadeInView } from '@/components/ui/motion';
import { ScreenContainer } from '@/components/ui/screen-container';
import { NotificationSkeleton } from '@/components/ui/skeleton';
import { Spacing } from '@/constants/theme';
import { useBrand } from '@/hooks/use-brand';
import { useNotifications } from '@/hooks/use-notifications';
import { useNotificationInbox } from '@/lib/notification-inbox';
import type { AppNotification } from '@/types';

export default function NotificationsScreen() {
  const brand = useBrand();
  const {
    state,
    retry,
    refresh,
    isRefreshing,
    refreshError,
    markRead,
    markAllRead,
    markingReadIds,
    isMarkingAllRead,
  } = useNotifications();
  const { refresh: refreshInbox } = useNotificationInbox();

  const handleTap = async (item: AppNotification) => {
    if (item.readAt) return;
    await markRead(item.id);
    refreshInbox();
  };

  const handleMarkAll = async () => {
    await markAllRead();
    refreshInbox();
  };

  const unreadCount = state.status === 'success' ? state.items.filter((n) => !n.readAt).length : 0;

  return (
    <ScreenContainer scroll onRefresh={refresh} refreshing={isRefreshing}>
      {refreshError && <InlineFeedback message={refreshError} />}

      {unreadCount > 0 && (
        <View style={styles.actionsRow}>
          <ThemedText type="small" themeColor="textSecondary">
            {unreadCount} unread
          </ThemedText>
          <Pressable
            onPress={handleMarkAll}
            disabled={isMarkingAllRead}
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
            accessibilityState={{ busy: isMarkingAllRead, disabled: isMarkingAllRead }}
            style={styles.markAllButton}
          >
            {isMarkingAllRead && <ActivityIndicator size="small" color={brand.primary} />}
            <ThemedText type="linkPrimary">
              {isMarkingAllRead ? 'Marking read' : 'Mark all as read'}
            </ThemedText>
          </Pressable>
        </View>
      )}

      {state.status === 'loading' && (
        <FadeInView style={styles.loadingGroup}>
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
        </FadeInView>
      )}

      {state.status === 'error' && (
        <FadeInView>
          <ErrorState message={state.message} onRetry={retry} />
        </FadeInView>
      )}

      {state.status === 'success' &&
        (state.items.length === 0 ? (
          <FadeInView>
            <EmptyState
              icon="notifications-outline"
              title="You're all caught up"
              message="Burger drops, special offers, and account updates will appear here."
            />
          </FadeInView>
        ) : (
          <View style={styles.list}>
            {state.items.map((item) => (
              <NotificationRow
                key={`${item.id}-${item.readAt ? 'read' : 'unread'}`}
                item={item}
                isProcessing={markingReadIds.includes(item.id)}
                onPress={() => handleTap(item)}
              />
            ))}
          </View>
        ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  markAllButton: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  loadingGroup: {
    gap: Spacing.three,
  },
  list: {
    gap: Spacing.three,
  },
});

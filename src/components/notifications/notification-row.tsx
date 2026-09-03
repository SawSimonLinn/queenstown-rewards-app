import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { FadeInView } from '@/components/ui/motion';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { formatRelativeTime } from '@/lib/format';
import type { AppNotification, NotificationType } from '@/types';

const CATEGORY_LABEL: Record<NotificationType, string> = {
  burger_drop: 'Burger Drop',
  special_offer: 'Special Offer',
  account_update: 'Account Update',
  redemption: 'Redemption',
};

export type NotificationRowProps = {
  item: AppNotification;
  isProcessing?: boolean;
  onPress: () => void;
};

export function NotificationRow({ item, isProcessing = false, onPress }: NotificationRowProps) {
  const isUnread = !item.readAt;

  return (
    <FadeInView layout>
      <Pressable
        onPress={onPress}
        disabled={isProcessing}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${CATEGORY_LABEL[item.type]}, ${isUnread ? 'unread' : 'read'}`}
        accessibilityState={{ busy: isProcessing, disabled: isProcessing }}
      >
        <Card
          noPadding
          style={[styles.card, isUnread && styles.cardUnread]}
          accessibilityLabel={item.title}
        >
          <View style={styles.row}>
            <View style={[styles.dot, isUnread && styles.dotUnread]} />
            <View style={styles.content}>
              <View style={styles.headerRow}>
                <ThemedText
                  type={isUnread ? 'smallBold' : 'small'}
                  themeColor={isUnread ? 'text' : 'textSecondary'}
                  style={styles.title}
                  numberOfLines={1}
                >
                  {item.title}
                </ThemedText>
                {isProcessing ? (
                  <ActivityIndicator size="small" color={Brand.primary} />
                ) : (
                  <ThemedText type="eyebrow" themeColor="textSecondary">
                    {formatRelativeTime(item.createdAt)}
                  </ThemedText>
                )}
              </View>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                {item.message}
              </ThemedText>
              <View style={styles.categoryPill}>
                <ThemedText type="eyebrow" style={styles.categoryText}>
                  {CATEGORY_LABEL[item.type]}
                </ThemedText>
              </View>
            </View>
          </View>
        </Card>
      </Pressable>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
  },
  cardUnread: {
    backgroundColor: Brand.primaryTint,
    borderColor: `${Brand.primary}33`,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    backgroundColor: 'transparent',
  },
  dotUnread: {
    backgroundColor: Brand.primary,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: Radius.small,
    backgroundColor: Brand.mutedSurface,
  },
  categoryText: {
    color: Brand.charcoal,
  },
});

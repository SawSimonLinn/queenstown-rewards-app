import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { LinearTransition, useReducedMotion } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { FadeInView, MotionDuration } from '@/components/ui/motion';
import { Brand, Radius, Spacing } from '@/constants/theme';
import type { RestaurantLocation } from '@/data/types';
import { getWeeklyScheduleRows, type ScheduleRow } from '@/lib/schedule';

/** Today plus the next two days — enough to answer "is it open soon" without the full week. */
const COLLAPSED_DAY_COUNT = 3;

export function WeeklySchedule({
  location,
  expanded,
  onToggleExpanded,
}: {
  location: RestaurantLocation;
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const rows = getWeeklyScheduleRows(location);
  const layoutTransition = reduceMotion
    ? undefined
    : LinearTransition.duration(MotionDuration.standard);

  const todayIndex = Math.max(
    rows.findIndex((row) => row.isToday),
    0
  );
  const canCollapse = rows.length > COLLAPSED_DAY_COUNT;
  const visibleRows =
    expanded || !canCollapse
      ? rows
      : Array.from(
          { length: COLLAPSED_DAY_COUNT },
          (_, offset) => rows[(todayIndex + offset) % rows.length]
        );

  return (
    <Animated.View layout={layoutTransition}>
      <Animated.View layout={layoutTransition}>
        {visibleRows.map((row, index) => (
          <FadeInView key={row.day} duration={MotionDuration.fast} layout>
            <ScheduleRowItem row={row} isLast={index === visibleRows.length - 1} />
          </FadeInView>
        ))}
      </Animated.View>

      {canCollapse && (
        <Pressable
          onPress={onToggleExpanded}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Show less' : 'View full schedule'}
          style={styles.toggleRow}
          hitSlop={8}
        >
          <ThemedText type="small" style={styles.toggleLabel}>
            {expanded ? 'Show less' : 'View full schedule'}
          </ThemedText>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={Brand.primary}
          />
        </Pressable>
      )}
    </Animated.View>
  );
}

function ScheduleRowItem({ row, isLast }: { row: ScheduleRow; isLast: boolean }) {
  return (
    <View style={[styles.row, !isLast && styles.rowDivider, row.isToday && styles.rowToday]}>
      <View style={styles.dayColumn}>
        <ThemedText type="smallBold" numberOfLines={1} style={styles.dayLabel}>
          {row.dayLabel}
        </ThemedText>
        {row.isToday && (
          <ThemedText type="eyebrow" numberOfLines={1} style={styles.todayTag}>
            Today
          </ThemedText>
        )}
      </View>

      <View style={styles.hoursColumn}>
        {row.status === 'closed' && (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            Closed
          </ThemedText>
        )}
        {row.status === 'unavailable' && (
          <ThemedText type="small" themeColor="textMuted" numberOfLines={1}>
            Hours unavailable
          </ThemedText>
        )}
        {row.status === 'periods' &&
          row.periods.map((period, index) => (
            <View key={`${period.label}-${index}`} style={styles.periodRow}>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                numberOfLines={1}
                style={styles.periodLabel}
              >
                {period.label}
              </ThemedText>
              <ThemedText type="small" numberOfLines={1} style={styles.periodHours}>
                {period.hours}
              </ThemedText>
            </View>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: `${Brand.charcoal}12`,
  },
  rowToday: {
    backgroundColor: `${Brand.primary}0D`,
    borderRadius: Radius.medium,
    marginHorizontal: -Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  dayColumn: {
    minWidth: 92,
    flexShrink: 0,
    gap: 2,
  },
  dayLabel: {
    color: Brand.charcoal,
  },
  todayTag: {
    color: Brand.primary,
  },
  hoursColumn: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 140,
    gap: Spacing.half,
    justifyContent: 'center',
  },
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  periodLabel: {
    minWidth: 48,
    flexShrink: 0,
  },
  periodHours: {
    color: Brand.charcoal,
    flexShrink: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.two,
  },
  toggleLabel: {
    color: Brand.primary,
    fontWeight: '700',
  },
});

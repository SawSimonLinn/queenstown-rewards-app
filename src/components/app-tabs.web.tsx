import { Ionicons } from '@expo/vector-icons';
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';

import { APP_NAME } from '@/constants/app';
import { Brand, Colors, MaxContentWidth, Radius, Shadows, Spacing } from '@/constants/theme';

const TAB_ICONS = {
  home: 'home' as const,
  rewards: 'gift' as const,
  locations: 'location' as const,
  profile: 'person' as const,
};

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton icon={TAB_ICONS.home}>Home</TabButton>
          </TabTrigger>
          <TabTrigger name="rewards" href="/rewards" asChild>
            <TabButton icon={TAB_ICONS.rewards}>Rewards</TabButton>
          </TabTrigger>
          <TabTrigger name="locations" href="/locations" asChild>
            <TabButton icon={TAB_ICONS.locations}>Locations</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton icon={TAB_ICONS.profile}>Profile</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & { icon: keyof typeof Ionicons.glyphMap };

export function TabButton({ children, isFocused, icon, ...props }: TabButtonProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <View
        style={[styles.tabButtonView, isFocused && { backgroundColor: Brand.primaryTint }]}
      >
        <Ionicons name={icon} size={16} color={isFocused ? Brand.primary : Colors.light.textSecondary} />
        <ThemedText type="small" style={isFocused ? styles.activeLabel : undefined} themeColor="textSecondary">
          {children}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const colors = Colors.light;

  return (
    <View {...props} style={styles.tabListContainer}>
      <View style={[styles.innerContainer, Shadows.raised, { borderColor: colors.border }]}>
        <ThemedText type="smallBold" style={[styles.brandText, { color: colors.text }]}>
          {APP_NAME}
        </ThemedText>

        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    backgroundColor: Colors.light.backgroundElement,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Radius.xlarge,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brandText: {
    marginRight: 'auto',
  },
  pressed: {
    opacity: 0.7,
  },
  activeLabel: {
    color: Brand.primary,
    fontWeight: '700',
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});

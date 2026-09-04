import { Ionicons } from '@expo/vector-icons';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';
import { useBrand } from '@/hooks/use-brand';
import { useProfileContext } from '@/lib/profile';

export default function AppTabs() {
  const colors = Colors.light;
  const brand = useBrand();
  const { profile } = useProfileContext();
  const isStaff = !!profile && profile.role !== 'customer';

  const sharedProps = {
    backgroundColor: colors.backgroundElement,
    indicatorColor: colors.backgroundSelected,
    iconColor: { default: colors.textSecondary, selected: brand.primary },
    labelStyle: {
      default: { color: colors.textSecondary },
      selected: { color: brand.primary },
    },
  } as const;

  return (
    <NativeTabs {...sharedProps}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="home" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="locations">
        <NativeTabs.Trigger.Label>Locations</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="location" />}
        />
      </NativeTabs.Trigger>

      {/* Staff-only, centered deliberately between Locations and Rewards so it
          lands in the middle of the bar once this fifth tab is present. */}
      <NativeTabs.Trigger name="requests" hidden={!isStaff}>
        <NativeTabs.Trigger.Label>Requests</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="qr-code" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="rewards">
        <NativeTabs.Trigger.Label>Rewards</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="gift" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="person" />}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

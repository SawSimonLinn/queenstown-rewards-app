import { Ionicons } from '@expo/vector-icons';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Brand, Colors } from '@/constants/theme';
import { useProfileContext } from '@/lib/profile';

export default function AppTabs() {
  const colors = Colors.light;
  const { profile } = useProfileContext();
  const isStaff = profile?.role === 'staff' || profile?.role === 'admin';

  const sharedProps = {
    backgroundColor: colors.backgroundElement,
    indicatorColor: colors.backgroundSelected,
    iconColor: { default: colors.textSecondary, selected: Brand.primary },
    labelStyle: {
      default: { color: colors.textSecondary },
      selected: { color: Brand.primary },
    },
  } as const;

  // NativeTabs reads its Trigger children via React.Children.toArray on its
  // direct children — that does NOT unwrap a <>...</> Fragment, so the two
  // tab sets must be two separate <NativeTabs> trees (each with Trigger
  // elements as literal direct children), not one <NativeTabs> whose single
  // child is a conditionally-chosen Fragment (that renders zero tabs).
  if (isStaff) {
    return (
      <NativeTabs {...sharedProps}>
        <NativeTabs.Trigger name="requests">
          <NativeTabs.Trigger.Label>Requests</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="qr-code" />}
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="my-location">
          <NativeTabs.Trigger.Label>My Location</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="storefront" />}
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="manage">
          <NativeTabs.Trigger.Label>Manage</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="pricetags" />}
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

  return (
    <NativeTabs {...sharedProps}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="home" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="rewards">
        <NativeTabs.Trigger.Label>Rewards</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="gift" />}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="locations">
        <NativeTabs.Trigger.Label>Locations</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="location" />}
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

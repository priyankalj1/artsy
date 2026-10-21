import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  Search,
  Calendar,
  User,
  LayoutDashboard,
  Wallet,
} from 'lucide-react-native';

const ACTIVE = '#6C63FF';
const INACTIVE = '#9CA3AF';

const USER_TABS = [
  { name: 'Home', Icon: Home },
  { name: 'Search', Icon: Search },
  { name: 'Bookings', Icon: Calendar },
  { name: 'Profile', Icon: User },
];

const ARTIST_TABS = [
  { name: 'Dashboard', Icon: LayoutDashboard },
  { name: 'Bookings', Icon: Calendar },
  { name: 'Earnings', Icon: Wallet },
  { name: 'Profile', Icon: User },
];

export default function BottomTabBar({
  state,
  descriptors,
  navigation,
  role = 'user',
}) {
  const insets = useSafeAreaInsets();
  const tabs = role === 'artist' ? ARTIST_TABS : USER_TABS;

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const tab = tabs[index] ?? { name: route.name, Icon: Home };
        const Icon = tab.Icon;
        const color = isFocused ? ACTIVE : INACTIVE;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={onPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={
              descriptors[route.key]?.options?.tabBarAccessibilityLabel
            }>
            <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
              <Icon
                size={22}
                color={color}
                strokeWidth={isFocused ? 2.25 : 2}
              />
            </View>
            <Text style={[styles.label, isFocused && styles.labelActive]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    minWidth: 52,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#6C63FF1A',
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
    color: INACTIVE,
    marginTop: 2,
  },
  labelActive: {
    color: ACTIVE,
    fontWeight: '700',
  },
});

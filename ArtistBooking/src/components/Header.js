import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { colors } from '../theme/colors';

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning 👋';
  if (hour < 17) return 'Good afternoon 👋';
  return 'Good evening 👋';
}

export default function Header({ userName = 'Guest', onNotificationPress }) {
  const greeting = useMemo(() => getTimeGreeting(), []);
  const initial = userName?.charAt(0)?.toUpperCase() || 'G';

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.name}>{userName}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationPress}
          activeOpacity={0.8}>
          <Bell size={18} color="#4B5563" strokeWidth={2} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>

        {/* <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F97316',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
});

import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../theme/colors'

export default function UserDashboard({ user, onLogout }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>User Dashboard</Text>
            <Text style={styles.name}>Welcome, {user?.name ?? 'User'}</Text>
            <Text style={styles.phone}>{user?.phone}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <DashboardCard
          title="Active bookings"
          value="2"
          subtitle="Events you have booked"
        />
        <DashboardCard
          title="Saved artists"
          value="8"
          subtitle="Artists in your favourites"
        />
        <DashboardCard
          title="Explore"
          value="500+"
          subtitle="Verified artists in Bangalore"
        />
      </ScrollView>
    </SafeAreaView>
  )
}

function DashboardCard({ title, value, subtitle }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  greeting: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  name: {
    marginTop: 6,
    color: colors.textDark,
    fontSize: 28,
    fontWeight: '800',
  },
  phone: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  logoutText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 20,
  },
  cardTitle: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
  cardValue: {
    marginTop: 10,
    color: colors.textDark,
    fontSize: 32,
    fontWeight: '800',
  },
  cardSubtitle: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
})

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { fetchEarningsApi } from '../api/artists';
import { fetchMyBookingsApi } from '../api/bookings';
import { formatINR } from '../utils/artistMapper';
import { colors } from '../theme/colors';

export default function EarningsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [earnings, setEarnings] = useState(null);
  const [upcoming, setUpcoming] = useState([]);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const [earnRes, bookingsRes] = await Promise.all([
        fetchEarningsApi(),
        fetchMyBookingsApi(),
      ]);
      setEarnings(earnRes?.data?.earnings || null);
      const list = (bookingsRes?.data?.bookings || []).filter(b =>
        ['pending', 'confirmed'].includes(b.status),
      );
      setUpcoming(list.slice(0, 5));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#6C63FF" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  const month = Number(earnings?.month_earnings || 0);
  const bars = earnings?.monthly || [];
  const max = Math.max(...bars.map(b => Number(b.total) || 0), 1);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
        }>
        <Text style={styles.title}>Earnings</Text>
        <Text style={styles.subtitle}>Track payouts and monthly earnings</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.earnCard}>
          <Text style={styles.earnLabel}>Earnings · This Month</Text>
          <Text style={styles.earnValue}>{formatINR(month)}</Text>
          <Text style={styles.earnTotal}>
            Lifetime {formatINR(earnings?.total_earnings || 0)}
          </Text>
          <View style={styles.bars}>
            {bars.map(bar => (
              <View key={bar.label} style={styles.barCol}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(
                        8,
                        (Number(bar.total) / max) * 52,
                      ),
                    },
                  ]}
                />
                <Text style={styles.barLabel}>{bar.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat
            label="Bookings"
            value={String(earnings?.month_bookings || 0)}
            sub="This month"
          />
          <Stat
            label="Upcoming"
            value={String(earnings?.upcoming_count || 0)}
            sub="Events"
          />
          <Stat
            label="Pending"
            value={String(earnings?.pending_count || 0)}
            sub="Requests"
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('Bookings')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {upcoming.length === 0 ? (
          <Text style={styles.empty}>No upcoming bookings</Text>
        ) : (
          upcoming.map(item => (
            <View key={item.booking_id} style={styles.bookingCard}>
              <View
                style={[
                  styles.dot,
                  item.status === 'confirmed'
                    ? styles.dotGreen
                    : styles.dotAmber,
                ]}
              />
              <View style={styles.bookingBody}>
                <Text style={styles.bookingName}>
                  {item.customer_name || item.client_name || 'Customer'}
                </Text>
                <Text style={styles.bookingMeta}>
                  {item.event_type || 'Event'} · {item.event_date}
                </Text>
              </View>
              <Text style={styles.bookingAmt}>{formatINR(item.amount)}</Text>
            </View>
          ))
        )}

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsGrid}>
          {[
            { label: 'Update Availability', icon: '📅', bg: '#EFF6FF' },
            { label: 'Edit Portfolio', icon: '🖼️', bg: '#F5F3FF' },
            { label: 'View Bookings', icon: '📅', bg: '#FFFBEB', route: 'Bookings' },
            { label: 'Withdraw Earnings', icon: '💰', bg: '#F0FDF4' },
          ].map(action => (
            <TouchableOpacity
              key={action.label}
              style={[styles.actionCard, { backgroundColor: action.bg }]}
              onPress={() =>
                action.route ? navigation?.navigate(action.route) : null
              }>
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, sub }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '900', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 16 },
  error: { color: '#DC2626', marginBottom: 12, fontWeight: '600' },
  earnCard: {
    backgroundColor: '#6C63FF',
    borderRadius: 24,
    padding: 20,
  },
  earnLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  earnValue: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '900',
    marginTop: 6,
  },
  earnTotal: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 4 },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 18,
    height: 70,
  },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  barLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 9,
    marginTop: 4,
  },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 12,
  },
  statValue: { fontSize: 18, fontWeight: '900', color: '#111827' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2, fontWeight: '600' },
  statSub: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#111827' },
  seeAll: { fontSize: 12, fontWeight: '700', color: '#6C63FF' },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  dot: { width: 6, height: 40, borderRadius: 4 },
  dotGreen: { backgroundColor: '#4ADE80' },
  dotAmber: { backgroundColor: '#FBBF24' },
  bookingBody: { flex: 1 },
  bookingName: { fontSize: 14, fontWeight: '800', color: '#111827' },
  bookingMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  bookingAmt: { fontSize: 14, fontWeight: '900', color: '#111827' },
  empty: { color: '#9CA3AF', fontSize: 13 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  actionCard: {
    width: '47%',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  actionIcon: { fontSize: 22 },
  actionLabel: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
});

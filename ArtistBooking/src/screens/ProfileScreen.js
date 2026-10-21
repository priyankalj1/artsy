import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { apiRequest } from '../api/client';
import { fetchMyArtistProfileApi } from '../api/artists';
import { fetchMyBookingsApi } from '../api/bookings';
import { getMyCustomerProfileApi } from '../api/users';
import { formatINR } from '../utils/artistMapper';
import { USER_ROLES } from '../constants/auth';
import { colors } from '../theme/colors';

export default function ProfileScreen({ user, role, onLogout }) {
  const isArtist = role === USER_ROLES.ARTIST;
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ bookings: 0, pending: 0 });
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const authMe = await apiRequest('/auth/me');
      let detail = null;
      if (isArtist) {
        try {
          const artistRes = await fetchMyArtistProfileApi();
          detail = artistRes?.data?.artist;
        } catch {
          detail = null;
        }
      } else {
        try {
          const customerRes = await getMyCustomerProfileApi();
          detail = customerRes?.data?.customer;
        } catch {
          detail = null;
        }
      }
      const bookingsRes = await fetchMyBookingsApi();
      const bookings = bookingsRes?.data?.bookings || [];
      setProfile({
        user: authMe?.data?.user || user,
        detail,
      });
      setStats({
        bookings: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
      });
    } catch (err) {
      setError(err.message);
      setProfile({ user, detail: null });
    } finally {
      setLoading(false);
    }
  }, [isArtist, user]);

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

  const u = profile?.user || user;
  const d = profile?.detail;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(u?.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.name}>{u?.name || 'User'}</Text>
            <Text style={styles.phone}>+91 {u?.phone}</Text>
            <Text style={styles.role}>
              {isArtist ? 'Artist profile' : 'Customer profile'}
            </Text>
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.statsRow}>
          <Stat label="Bookings" value={String(stats.bookings)} />
          <Stat label="Pending" value={String(stats.pending)} />
          {isArtist ? (
            <Stat
              label="Price"
              value={
                d?.price_type === 'quote'
                  ? 'Quote'
                  : formatINR(d?.price || 0)
              }
            />
          ) : (
            <Stat
              label="Location"
              value={d?.location || u?.location || '—'}
            />
          )}
        </View>

        {isArtist && d ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Artist details</Text>
            <Row label="Category" value={d.category || '—'} />
            <Row label="Experience" value={d.experience || '—'} />
            <Row
              label="Languages"
              value={(d.languages || []).join(', ') || '—'}
            />
            <Row label="Events" value={(d.events || []).join(', ') || '—'} />
            <Row label="Bio" value={d.bio || '—'} />
          </View>
        ) : null}

        {!isArtist && d ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Preferences</Text>
            <Row label="Location" value={d.location || '—'} />
            <Row
              label="Interests"
              value={(d.interests || []).join(', ') || '—'}
            />
          </View>
        ) : null}

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  headerText: { flex: 1 },
  name: { fontSize: 22, fontWeight: '900', color: '#111827' },
  phone: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  role: { fontSize: 12, color: '#6C63FF', fontWeight: '700', marginTop: 4 },
  error: { color: '#DC2626', marginTop: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  stat: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 12,
  },
  statValue: { fontSize: 16, fontWeight: '900', color: '#111827' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 4, fontWeight: '600' },
  card: {
    marginTop: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: '900', color: '#111827', marginBottom: 8 },
  row: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  rowLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '700' },
  rowValue: { fontSize: 14, color: '#111827', fontWeight: '600', marginTop: 2 },
  logoutBtn: {
    marginTop: 24,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: '#6C63FF', fontWeight: '800', fontSize: 15 },
});

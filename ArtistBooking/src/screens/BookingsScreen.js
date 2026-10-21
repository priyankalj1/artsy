import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchMyBookingsApi,
  updateBookingStatusApi,
} from '../api/bookings';
import { formatINR } from '../utils/artistMapper';
import { USER_ROLES } from '../constants/auth';
import { colors } from '../theme/colors';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function BookingsScreen({ role = USER_ROLES.USER }) {
  const isArtist = role === USER_ROLES.ARTIST;
  const [status, setStatus] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');
      try {
        const result = await fetchMyBookingsApi(
          status === 'all' ? undefined : status,
        );
        setBookings(result?.data?.bookings || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [status],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const updateStatus = async (bookingId, nextStatus) => {
    setUpdatingId(bookingId);
    try {
      await updateBookingStatusApi(bookingId, nextStatus);
      await load(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmCancel = async () => {
    const bookingId = cancelTarget?.booking_id;
    setCancelTarget(null);
    if (!bookingId) return;
    await updateStatus(bookingId, 'cancelled');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>
          {isArtist ? 'Artist Bookings' : 'Your Bookings'}
        </Text>
        <Text style={styles.subtitle}>
          {isArtist
            ? 'Manage incoming and confirmed bookings'
            : 'Upcoming and past event bookings'}
        </Text>
      </View>

      <View style={styles.filters}>
        {FILTERS.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.chip, status === item.id && styles.chipActive]}
            onPress={() => setStatus(item.id)}>
            <Text
              style={[
                styles.chipText,
                status === item.id && styles.chipTextActive,
              ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#6C63FF" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => String(item.booking_id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📅</Text>
              <Text style={styles.emptyTitle}>No bookings yet</Text>
              <Text style={styles.emptySub}>
                {isArtist
                  ? 'New booking requests will show up here'
                  : 'Book an artist to see it here'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              isArtist={isArtist}
              updating={updatingId === item.booking_id}
              onConfirm={() => updateStatus(item.booking_id, 'confirmed')}
              onCancel={() => setCancelTarget(item)}
              onComplete={() => updateStatus(item.booking_id, 'completed')}
            />
          )}
        />
      )}

      <Modal
        visible={!!cancelTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelTarget(null)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCancelTarget(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Cancel booking?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to cancel this booking?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalNo}
                onPress={() => setCancelTarget(null)}>
                <Text style={styles.modalNoText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalYes} onPress={confirmCancel}>
                <Text style={styles.modalYesText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function BookingCard({
  booking,
  isArtist,
  updating,
  onConfirm,
  onCancel,
  onComplete,
}) {
  const title = isArtist
    ? booking.customer_name || booking.client_name || 'Customer'
    : booking.artist_name || 'Artist';
  const subtitle = isArtist
    ? booking.event_type || 'Event'
    : booking.artist_category || booking.event_type || 'Event';

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.statusBar,
          booking.status === 'confirmed' || booking.status === 'completed'
            ? styles.statusGreen
            : booking.status === 'pending'
              ? styles.statusAmber
              : styles.statusGray,
        ]}
      />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>{booking.status}</Text>
          </View>
        </View>
        <Text style={styles.cardSub}>
          {subtitle} · {formatDate(booking.event_date)}
        </Text>
        {booking.event_time ? (
          <Text style={styles.cardTime}>🕒 {booking.event_time}</Text>
        ) : null}
        <Text style={styles.cardAmount}>{formatINR(booking.amount)}</Text>

        {isArtist && booking.status === 'pending' ? (
          <View style={styles.actions}>
            <ActionButton
              label="Confirm"
              onPress={onConfirm}
              disabled={updating}
              primary
            />
            <ActionButton
              label="Decline"
              onPress={onCancel}
              disabled={updating}
            />
          </View>
        ) : null}

        {isArtist && booking.status === 'confirmed' ? (
          <View style={styles.actions}>
            <ActionButton
              label="Mark Completed"
              onPress={onComplete}
              disabled={updating}
              primary
            />
          </View>
        ) : null}

        {!isArtist &&
        (booking.status === 'pending' || booking.status === 'confirmed') ? (
          <View style={styles.actions}>
            <ActionButton
              label="Cancel booking"
              onPress={onCancel}
              disabled={updating}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function ActionButton({ label, onPress, disabled, primary }) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, primary && styles.actionBtnPrimary]}
      onPress={onPress}
      disabled={disabled}>
      <Text
        style={[styles.actionText, primary && styles.actionTextPrimary]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(value);
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: 20, paddingTop: 4 },
  title: { fontSize: 22, fontWeight: '900', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  chipText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
  chipTextActive: { color: '#FFF' },
  list: { paddingHorizontal: 20, paddingBottom: 30 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
    overflow: 'hidden',
  },
  statusBar: { width: 6 },
  statusGreen: { backgroundColor: '#4ADE80' },
  statusAmber: { backgroundColor: '#FBBF24' },
  statusGray: { backgroundColor: '#D1D5DB' },
  cardBody: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '900', color: '#111827' },
  statusPill: {
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
    textTransform: 'capitalize',
  },
  cardSub: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  cardTime: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  cardAmount: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  actionBtnPrimary: { backgroundColor: '#6C63FF' },
  actionText: { fontSize: 12, fontWeight: '700', color: '#374151' },
  actionTextPrimary: { color: '#FFF' },
  error: { color: '#DC2626', padding: 20, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 42 },
  emptyTitle: { marginTop: 10, fontSize: 16, fontWeight: '900', color: '#374151' },
  emptySub: { marginTop: 4, fontSize: 13, color: '#9CA3AF' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 22,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  modalMessage: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalNo: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  modalNoText: { fontSize: 15, fontWeight: '800', color: '#374151' },
  modalYes: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C63FF',
  },
  modalYesText: { fontSize: 15, fontWeight: '800', color: '#FFF' },
});

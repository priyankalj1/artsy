import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBookingApi } from '../api/bookings';
import { formatINR } from '../utils/artistMapper';
import { colors } from '../theme/colors';

const TIMES = ['8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'];
const EVENT_TYPES = ['Wedding', 'Reception', 'Sangeet', 'Corporate', 'Birthday'];

export default function CreateBookingScreen({ route, navigation }) {
  const artist = route.params?.artist;
  const artistId = route.params?.artistId || artist?.artist_id;

  const dates = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        return d;
      }),
    [],
  );

  const [step, setStep] = useState(0);
  const [selDate, setSelDate] = useState(0);
  const [selTime, setSelTime] = useState(TIMES[1]);
  const [hours, setHours] = useState(4);
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [location, setLocation] = useState(artist?.location || 'Indiranagar');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const base =
    artist?.priceType === 'fixed' || artist?.price_type === 'fixed'
      ? Number(artist.price) || 0
      : 15000;
  const fee = Math.round(base * 0.05);
  const total = base + fee;

  const canContinue = () => {
    if (step === 0) return selDate !== null && !!selTime;
    if (step === 1) return !!eventType && location.trim().length >= 2;
    return true;
  };

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const eventDate = dates[selDate].toISOString().slice(0, 10);
      const result = await createBookingApi({
        artist_id: Number(artistId),
        event_date: eventDate,
        event_time: selTime,
        duration_hours: hours,
        event_type: eventType,
        location: location.trim(),
        notes: notes.trim(),
        amount: total,
      });
      setSuccess(result?.data?.booking);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    setError('');
    if (step === 0 || step === 1) {
      setStep(step + 1);
      return;
    }
    if (step === 2) {
      submit();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.top}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Book {artist?.name || 'Artist'}</Text>
          <Text style={styles.sub}>{artist?.category || ''}</Text>
        </View>
      </View>

      {step < 3 ? (
        <View style={styles.steps}>
          {['Date & Time', 'Details', 'Payment'].map((label, i) => (
            <View key={label} style={styles.stepItem}>
              <View
                style={[styles.stepDot, i <= step && styles.stepDotActive]}>
                <Text style={styles.stepDotText}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepLabel, i <= step && styles.stepLabelActive]}>
                {label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content}>
        {step === 0 && (
          <>
            <Text style={styles.section}>Select Date</Text>
            <View style={styles.dateGrid}>
              {dates.map((d, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.dateChip, selDate === i && styles.dateChipActive]}
                  onPress={() => setSelDate(i)}>
                  <Text
                    style={[
                      styles.dateWeek,
                      selDate === i && styles.dateTextActive,
                    ]}>
                    {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                  </Text>
                  <Text
                    style={[
                      styles.dateDay,
                      selDate === i && styles.dateTextActive,
                    ]}>
                    {d.getDate()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.section}>Duration</Text>
            <View style={styles.durationRow}>
              <TouchableOpacity
                style={styles.durBtn}
                onPress={() => setHours(Math.max(1, hours - 1))}>
                <Text style={styles.durBtnText}>−</Text>
              </TouchableOpacity>
              <View style={styles.durMid}>
                <Text style={styles.durValue}>{hours}</Text>
                <Text style={styles.durUnit}>hours</Text>
              </View>
              <TouchableOpacity
                style={[styles.durBtn, styles.durBtnPrimary]}
                onPress={() => setHours(Math.min(12, hours + 1))}>
                <Text style={[styles.durBtnText, { color: '#6C63FF' }]}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.section}>Select Time</Text>
            <View style={styles.timeGrid}>
              {TIMES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.timeChip, selTime === t && styles.timeChipActive]}
                  onPress={() => setSelTime(t)}>
                  <Text
                    style={[
                      styles.timeText,
                      selTime === t && styles.timeTextActive,
                    ]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <Text style={styles.section}>Event Type</Text>
            <View style={styles.timeGrid}>
              {EVENT_TYPES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.timeChip,
                    eventType === t && styles.timeChipActive,
                  ]}
                  onPress={() => setEventType(t)}>
                  <Text
                    style={[
                      styles.timeText,
                      eventType === t && styles.timeTextActive,
                    ]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.section}>Location</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              style={styles.input}
              placeholder="Event location"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.section}>Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              style={[styles.input, styles.textArea]}
              placeholder="Any special requests"
              placeholderTextColor="#9CA3AF"
              multiline
            />
          </>
        )}

        {step === 2 && (
          <View style={styles.summary}>
            <Row label="Artist" value={artist?.name || '—'} />
            <Row
              label="Date"
              value={dates[selDate].toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            />
            <Row label="Time" value={selTime} />
            <Row label="Duration" value={`${hours} hours`} />
            <Row label="Event" value={eventType} />
            <Row label="Location" value={location} />
            <Row label="Base" value={formatINR(base)} />
            <Row label="Platform fee" value={formatINR(fee)} />
            <Row label="Total" value={formatINR(total)} bold />
          </View>
        )}

        {step === 3 && success ? (
          <View style={styles.successBox}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>Booking requested!</Text>
            <Text style={styles.successSub}>
              #{success.booking_id} · {success.status}
            </Text>
            <TouchableOpacity
              style={styles.cta}
              onPress={() => {
                navigation.popToTop();
                navigation.navigate('Tabs', { screen: 'Bookings' });
              }}>
              <Text style={styles.ctaText}>View Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondary}
              onPress={() => navigation.popToTop()}>
              <Text style={styles.secondaryText}>Done</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      {step < 3 ? (
        <View style={styles.footer}>
          {step > 0 ? (
            <TouchableOpacity
              style={styles.backFooter}
              onPress={() => setStep(step - 1)}
              disabled={loading}>
              <Text style={styles.backFooterText}>←</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[
              styles.continue,
              (!canContinue() || loading) && styles.continueDisabled,
            ]}
            disabled={!canContinue() || loading}
            onPress={handleContinue}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.continueText}>
                {step < 2 ? 'Continue' : `Pay ${formatINR(total)}`}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function Row({ label, value, bold }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontSize: 18, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '900', color: '#111827' },
  sub: { fontSize: 12, color: '#6B7280' },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: '#6C63FF' },
  stepDotText: { fontSize: 11, fontWeight: '900', color: '#FFF' },
  stepLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF' },
  stepLabelActive: { color: '#6C63FF' },
  content: { padding: 16, paddingBottom: 120 },
  section: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 10,
    marginTop: 12,
  },
  dateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dateChip: {
    width: '22%',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 10,
  },
  dateChipActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  dateWeek: { fontSize: 10, fontWeight: '700', color: '#6B7280' },
  dateDay: { fontSize: 16, fontWeight: '900', color: '#111827', marginTop: 2 },
  dateTextActive: { color: '#FFF' },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
  },
  durBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durBtnPrimary: { backgroundColor: '#6C63FF1A' },
  durBtnText: { fontSize: 22, fontWeight: '900', color: '#374151' },
  durMid: { flex: 1, alignItems: 'center' },
  durValue: { fontSize: 28, fontWeight: '900', color: '#111827' },
  durUnit: { fontSize: 12, color: '#6B7280' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: {
    width: '47%',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  timeChipActive: { borderColor: '#6C63FF', backgroundColor: '#6C63FF0D' },
  timeText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  timeTextActive: { color: '#6C63FF' },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  summary: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  rowLabel: { color: '#6B7280', fontSize: 13 },
  rowValue: { color: '#111827', fontSize: 13, fontWeight: '700' },
  rowBold: { fontSize: 16, fontWeight: '900' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    paddingBottom: 28,
    backgroundColor: '#FAFAFA',
  },
  backFooter: {
    width: 48,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backFooterText: { fontSize: 18, fontWeight: '700' },
  continue: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueDisabled: { opacity: 0.45 },
  continueText: { color: '#FFF', fontWeight: '900', fontSize: 15 },
  error: { color: '#DC2626', marginTop: 12, fontWeight: '600' },
  successBox: { alignItems: 'center', paddingTop: 40 },
  successEmoji: { fontSize: 48 },
  successTitle: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  successSub: { marginTop: 6, color: '#6B7280' },
  cta: {
    marginTop: 24,
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  ctaText: { color: '#FFF', fontWeight: '900' },
  secondary: { marginTop: 12, padding: 10 },
  secondaryText: { color: '#6C63FF', fontWeight: '700' },
});

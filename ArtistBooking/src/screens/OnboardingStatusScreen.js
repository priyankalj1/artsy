import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { fetchOnboardingStatus } from '../auth/authService';
import { USER_ROLES } from '../constants/auth';
import {
  ARTIST_STEP_INDEX,
  CUSTOMER_STEP_INDEX,
} from '../constants/onboarding';
import { colors } from '../theme/colors';

export default function OnboardingStatusScreen({ navigation, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [onboarding, setOnboarding] = useState(null);
  const [draft, setDraft] = useState({});

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    const result = await fetchOnboardingStatus();
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setUser(result.user);
    setOnboarding(result.onboarding);
    setDraft(result.draft || {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openStep = (stepId, { lockStep = false } = {}) => {
    if (stepId === 'role' || !user?.role) {
      navigation.navigate('RoleSelection', { phone: user?.phone });
      return;
    }

    if (user.role === USER_ROLES.ARTIST) {
      navigation.navigate('ArtistOnboard', {
        phone: user.phone,
        editStep: ARTIST_STEP_INDEX[stepId],
        lockStep,
      });
      return;
    }

    navigation.navigate('CustomerOnboard', {
      phone: user.phone,
      editStep: CUSTOMER_STEP_INDEX[stepId],
      lockStep,
    });
  };

  const steps = onboarding?.steps || [];
  const firstPending = steps.find(step => step.status !== 'done');
  const doneCount = steps.filter(step => step.status === 'done').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Finish setting up</Text>
        <Text style={styles.title}>Your onboarding</Text>
        <Text style={styles.subtitle}>
          {firstPending
            ? `You left off at ${firstPending.label}. Complete the pending steps to start using the app.`
            : 'All steps look complete. Open the last step to submit your profile.'}
        </Text>

        {loading ? (
          <ActivityIndicator color="#6C63FF" style={styles.loader} />
        ) : (
          <View style={styles.list}>
            {steps.map((step, index) => {
              const done = step.status === 'done';
              const isNext = firstPending?.id === step.id;
              const locked = !done && !isNext && index > 0 && steps[index - 1]?.status !== 'done';
              return (
                <TouchableOpacity
                  key={step.id}
                  style={[
                    styles.row,
                    done && styles.rowDone,
                    isNext && styles.rowNext,
                    locked && styles.rowLocked,
                  ]}
                  onPress={() => !locked && openStep(step.id, { lockStep: true })}
                  disabled={locked}
                  activeOpacity={0.85}>
                  <View
                    style={[
                      styles.badge,
                      done && styles.badgeDone,
                      isNext && styles.badgeNext,
                    ]}>
                    <Text style={styles.badgeText}>{done ? '✓' : index + 1}</Text>
                  </View>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>{step.label}</Text>
                    <Text style={styles.rowDesc}>
                      {done ? 'Completed' : step.description || 'Pending'}
                    </Text>
                  </View>
                  <Text style={styles.rowCta}>
                    {done ? 'Edit' : locked ? '' : 'Continue'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {firstPending ? (
          <TouchableOpacity
            style={styles.primary}
            onPress={() => openStep(firstPending.id)}>
            <Text style={styles.primaryText}>Continue onboarding</Text>
          </TouchableOpacity>
        ) : steps.length ? (
          <TouchableOpacity
            style={styles.primary}
            onPress={() => openStep(steps[steps.length - 1].id)}>
            <Text style={styles.primaryText}>Review and submit</Text>
          </TouchableOpacity>
        ) : null}

        <Text style={styles.progressMeta}>
          {doneCount} of {steps.length || 0} steps done
        </Text>

        {onLogout ? (
          <TouchableOpacity onPress={onLogout} style={styles.logout}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 24, paddingBottom: 40 },
  eyebrow: { fontSize: 13, fontWeight: '700', color: '#6C63FF' },
  title: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: '800',
    color: colors.textDark,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: '#6B7280',
  },
  loader: { marginTop: 32 },
  list: { marginTop: 24, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    gap: 12,
  },
  rowDone: { borderColor: '#C7D2FE', backgroundColor: '#F5F3FF' },
  rowNext: { borderColor: '#6C63FF' },
  rowLocked: { opacity: 0.55 },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDone: { backgroundColor: '#6C63FF' },
  badgeNext: { backgroundColor: '#8B5CF6' },
  badgeText: { color: '#FFF', fontWeight: '800' },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  rowDesc: { marginTop: 2, fontSize: 12, color: '#6B7280' },
  rowCta: { fontSize: 12, fontWeight: '700', color: '#6C63FF' },
  error: { marginTop: 16, color: '#DC2626', fontWeight: '600' },
  primary: {
    marginTop: 24,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  progressMeta: {
    marginTop: 12,
    textAlign: 'center',
    color: '#9CA3AF',
    fontWeight: '600',
  },
  logout: { marginTop: 20, alignItems: 'center' },
  logoutText: { color: '#6B7280', fontWeight: '700' },
});

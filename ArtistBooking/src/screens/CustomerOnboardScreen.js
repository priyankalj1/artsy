import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORIES } from '../data/mockData';
import { onboardCustomer, fetchOnboardingStatus, saveOnboardingProgress } from '../auth/authService';
import {
  ALLOWED_LOCATIONS,
  validateCustomerName,
  validateInterests,
  validateLocation,
  validateCustomerOnboard,
} from '../utils/validation';
import { colors } from '../theme/colors';
import { CUSTOMER_STEP_BY_INDEX, resumeCustomerStepIndex } from '../constants/onboarding';

const STEPS = ['Name', 'Interests', 'Location'];

export default function CustomerOnboardScreen({
  route,
  navigation,
  onAuthenticated,
}) {
  const draft = route.params?.draft || {};
  const [step, setStep] = useState(route.params?.initialStep ?? 0);
  const [name, setName] = useState(draft.name || '');
  const [interests, setInterests] = useState(draft.interests || []);
  const [location, setLocation] = useState(draft.location || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(true);

  const goToStep = nextStep => {
    setStep(nextStep);
    navigation.setParams({ editStep: nextStep, lockStep: false });
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setHydrating(true);
      const result = await fetchOnboardingStatus();
      if (cancelled) return;

      if (result.success) {
        const next = result.draft || {};
        if (next.name != null) setName(next.name);
        if (next.interests) setInterests(next.interests);
        if (next.location != null) setLocation(next.location);
        const apiStep = resumeCustomerStepIndex(result.onboarding?.current_step);
        const nextStep = route.params?.lockStep
          ? route.params.editStep ?? apiStep
          : apiStep;
        setStep(nextStep);
        navigation.setParams({
          editStep: nextStep,
          lockStep: Boolean(route.params?.lockStep),
        });
      }
      setHydrating(false);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleInterest = id => {
    setInterests(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
    if (error) setError('');
  };

  const validateCurrentStep = () => {
    if (step === 0) {
      const result = validateCustomerName(name);
      if (!result.valid) {
        setError(result.error);
        return false;
      }
      return true;
    }

    if (step === 1) {
      const result = validateInterests(interests);
      if (!result.valid) {
        setError(result.error);
        return false;
      }
      return true;
    }

    if (step === 2) {
      const result = validateLocation(location);
      if (!result.valid) {
        setError(result.error);
        return false;
      }
      return true;
    }

    return false;
  };

  const canContinue = () => {
    if (step === 0) return name.trim().length >= 2;
    if (step === 1) return interests.length > 0;
    if (step === 2) return location.trim().length > 0;
    return false;
  };

  const handleContinue = async () => {
    setError('');

    if (!validateCurrentStep()) {
      return;
    }

    if (step < STEPS.length - 1) {
      setLoading(true);
      const saved = await saveOnboardingProgress(CUSTOMER_STEP_BY_INDEX[step], {
        name,
        interests,
        location,
      });
      setLoading(false);
      if (!saved.success) {
        setError(saved.error);
        return;
      }
      goToStep(step + 1);
      return;
    }

    const validation = validateCustomerOnboard({ name, interests, location });
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    const result = await onboardCustomer(validation.value);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onAuthenticated(result.session);
  };

  if (hydrating) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.hydrateWrap}>
          <ActivityIndicator color="#6C63FF" size="large" />
          <Text style={styles.hydrateText}>Restoring your progress…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.progressWrap}>
          <View style={styles.progressRow}>
            {STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressBar,
                  index <= step && styles.progressBarActive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.stepLabel}>
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </Text>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {step === 0 && (
            <>
              <Text style={styles.title}>What's your name?</Text>
              <Text style={styles.subtitle}>
                Let artists know who's booking them
              </Text>
              <TextInput
                value={name}
                onChangeText={text => {
                  setName(text);
                  if (error) setError('');
                }}
                placeholder="Your full name"
                placeholderTextColor="#D1D5DB"
                style={styles.input}
                autoFocus
                editable={!loading}
                maxLength={100}
              />
            </>
          )}

          {step === 1 && (
            <>
              <Text style={styles.title}>What's your plan?</Text>
              <Text style={styles.subtitle}>
                Pick categories you're interested in
              </Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map(cat => {
                  const selected = interests.includes(cat.id);
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryItem,
                        selected && styles.categoryItemActive,
                      ]}
                      onPress={() => toggleInterest(cat.id)}
                      disabled={loading}>
                      <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                      <Text
                        style={[
                          styles.categoryName,
                          selected && styles.categoryNameActive,
                        ]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.title}>Your location?</Text>
              <Text style={styles.subtitle}>
                We'll show artists near your area
              </Text>
              <View style={styles.locationInputWrap}>
                <Text style={styles.locationIcon}>📍</Text>
                <TextInput
                  value={location}
                  onChangeText={text => {
                    setLocation(text);
                    if (error) setError('');
                  }}
                  placeholder="Search neighbourhood..."
                  placeholderTextColor="#D1D5DB"
                  style={styles.locationInput}
                  editable={!loading}
                  maxLength={100}
                />
              </View>
              <View style={styles.locationList}>
                {ALLOWED_LOCATIONS.map(area => (
                  <TouchableOpacity
                    key={area}
                    style={[
                      styles.locationOption,
                      location === area && styles.locationOptionActive,
                    ]}
                    onPress={() => {
                      setLocation(area);
                      if (error) setError('');
                    }}
                    disabled={loading}>
                    <Text style={styles.locationOptionIcon}>📍</Text>
                    <Text
                      style={[
                        styles.locationOptionText,
                        location === area && styles.locationOptionTextActive,
                      ]}>
                      {area}, Bangalore
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          {step > 0 ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setError('');
                goToStep(step - 1);
              }}
              disabled={loading}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('OnboardingStatus')}
              disabled={loading}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!canContinue() || loading) && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!canContinue() || loading}>
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.continueButtonText}>
                {step < STEPS.length - 1 ? 'Continue' : 'Start Exploring 🎉'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  flex: {
    flex: 1,
  },
  hydrateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  hydrateText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  progressWrap: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  progressBarActive: {
    backgroundColor: '#6C63FF',
  },
  stepLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textDark,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 22,
  },
  input: {
    marginTop: 28,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 28,
  },
  categoryItem: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    backgroundColor: colors.white,
  },
  categoryItemActive: {
    borderColor: '#6C63FF',
    backgroundColor: '#6C63FF0D',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  categoryNameActive: {
    color: '#6C63FF',
  },
  locationInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
  },
  locationList: {
    marginTop: 16,
    gap: 8,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  locationOptionActive: {
    backgroundColor: '#6C63FF1A',
  },
  locationOptionIcon: {
    marginRight: 12,
  },
  locationOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  locationOptionTextActive: {
    color: '#6C63FF',
  },
  errorText: {
    marginTop: 16,
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
  },
  backButton: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#374151',
  },
  continueButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonFull: {
    flex: 1,
  },
  continueButtonDisabled: {
    opacity: 0.45,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
});

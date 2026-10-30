import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  InputAccessoryView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  establishSessionFromAuth,
  requestOtp,
  verifyOtpCode,
} from '../auth/authService';
import { validateOtp } from '../utils/validation';
import { colors } from '../theme/colors';
import { customToast } from '../utils/toast';

const { width } = Dimensions.get('window');
const OTP_INPUT_ACCESSORY_ID = 'otpInput';
const DEFAULT_COOLDOWN = 30;

export default function OtpScreen({ navigation, route, onAuthenticated }) {
  const phone = route.params?.phone ?? '';
  const initialOtp = route.params?.otp ?? '';
  const initialCooldown =
    route.params?.retryAfterSeconds ?? DEFAULT_COOLDOWN;

  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState(initialOtp);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(initialCooldown);

  useEffect(() => {
    if (cooldown <= 0) {
      return undefined;
    }
    const timer = setTimeout(() => setCooldown(value => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const goNextAfterLogin = (session, userPhone) => {
    const user = session?.user;
    const resolvedPhone = user?.phone || userPhone || phone;

    // Parent session update (needed for Main tabs when onboarded)
    if (onAuthenticated) {
      onAuthenticated(session);
    }

    // Not onboarded yet → stay in Auth stack and move forward explicitly.
    // (Updating session alone does not change the current OTP route.)
    if (!user?.is_onboarded) {
      if (!user?.role) {
        navigation.replace('RoleSelection', { phone: resolvedPhone });
        return;
      }
      navigation.replace('OnboardingStatus');
    }
  };

  const handleVerify = async () => {
    setError('');

    const otpResult = validateOtp(otp);
    if (!otpResult.valid) {
      setError(otpResult.error);
      customToast(otpResult.error, 'error');
      return;
    }

    setLoading(true);
    const result = await verifyOtpCode(phone, otpResult.value);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    Keyboard.dismiss();
    customToast('Logged in successfully', 'success');

    const session = await establishSessionFromAuth(result.user, result.token, {
      onboarding: result.onboarding,
    });

    if (!session) {
      setError('Login succeeded but session could not be created.');
      customToast('Login succeeded but session could not be created.', 'error');
      return;
    }

    goNextAfterLogin(session, result.phone || phone);
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending || !phone) {
      if (cooldown > 0) {
        customToast(
          `Please wait ${cooldown}s before requesting another OTP`,
          'error',
        );
      }
      return;
    }

    setResending(true);
    setError('');
    const result = await requestOtp(phone);
    setResending(false);

    if (!result.success) {
      setError(result.error);
      if (result.retryAfterSeconds) {
        setCooldown(result.retryAfterSeconds);
      }
      return;
    }

    if (result.otp) {
      setDemoOtp(result.otp);
    }
    setCooldown(result.retryAfterSeconds ?? DEFAULT_COOLDOWN);
    customToast('OTP sent successfully', 'success');
  };

  return (
    <LinearGradient
      colors={[colors.primaryLight, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              disabled={loading || resending}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>Enter OTP</Text>
              <Text style={styles.subtitle}>
                We sent a code to +91 {phone || 'your number'}.
              </Text>
              {demoOtp ? (
                <Text style={styles.demoOtp}>
                  Your OTP is {demoOtp}.{'\n'}Type it below to continue.
                </Text>
              ) : null}
            </View>

            <Text style={styles.label}>One-time password</Text>
            <TextInput
              value={otp}
              onChangeText={text => {
                setOtp(text.replace(/\D/g, '').slice(0, 4));
                if (error) setError('');
              }}
              placeholder="••••"
              placeholderTextColor="rgba(255,255,255,0.45)"
              keyboardType="number-pad"
              maxLength={4}
              editable={!loading && !resending}
              style={styles.input}
              inputAccessoryViewID={
                Platform.OS === 'ios' ? OTP_INPUT_ACCESSORY_ID : undefined
              }
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={loading || resending}>
              {loading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.buttonText}>Verify & Continue</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleResend}
              disabled={resending || loading}
              style={styles.resendButton}
              hitSlop={{ top: 12, bottom: 12, left: 24, right: 24 }}>
              {resending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.resendText}>
                  {cooldown > 0
                    ? `Resend OTP in ${cooldown}s`
                    : 'Resend OTP'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={OTP_INPUT_ACCESSORY_ID}>
          <View style={styles.keyboardAccessory}>
            <TouchableOpacity onPress={Keyboard.dismiss}>
              <Text style={styles.keyboardDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 48,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 8,
    left: 32,
    zIndex: 2,
  },
  backText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    marginBottom: 28,
  },
  title: {
    color: colors.white,
    fontSize: 36,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 12,
    color: colors.textMuted,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '600',
  },
  demoOtp: {
    marginTop: 16,
    color: colors.white,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '800',
  },
  label: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  input: {
    height: 58,
    borderRadius: 18,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },
  button: {
    width: width - 64,
    height: 60,
    backgroundColor: colors.white,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 14,
    minHeight: 48,
    justifyContent: 'center',
  },
  resendText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  keyboardAccessory: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: '#F3F4F6',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  keyboardDoneText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '700',
  },
});

import React, { useState } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  establishSessionFromAuth,
  verifyOtpCode,
} from '../auth/authService';
import { validateOtp } from '../utils/validation';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const OTP_INPUT_ACCESSORY_ID = 'otpInput';

export default function OtpScreen({ navigation, route, onAuthenticated }) {
  const phone = route.params?.phone ?? '';
  const displayedOtp = route.params?.otp ?? '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setError('');

    const otpResult = validateOtp(otp);
    if (!otpResult.valid) {
      setError(otpResult.error);
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

    const session = await establishSessionFromAuth(result.user, result.token, {
      onboarding: result.onboarding,
    });

    if (session && onAuthenticated) {
      onAuthenticated(session);
    }
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
          style={styles.content}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            disabled={loading}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.subtitle}>
              We sent a code to +91 {phone || 'your number'}.
            </Text>
            {displayedOtp ? (
              <Text style={styles.demoOtp}>
                Your OTP is {displayedOtp}.{'\n'}Type it below to continue.
              </Text>
            ) : null}
          </View>

          <View style={styles.form}>
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
              editable={!loading}
              style={styles.input}
              inputAccessoryViewID={
                Platform.OS === 'ios' ? OTP_INPUT_ACCESSORY_ID : undefined
              }
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.buttonText}>Verify & Continue</Text>
              )}
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 8,
    left: 32,
  },
  backText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    marginBottom: 36,
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
  form: {
    gap: 12,
  },
  label: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
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
    marginTop: 4,
  },
  button: {
    width: width - 64,
    height: 60,
    backgroundColor: colors.white,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '700',
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

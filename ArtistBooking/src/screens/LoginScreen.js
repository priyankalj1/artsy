import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  InputAccessoryView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { requestOtp } from '../auth/authService';
import { validatePhone } from '../utils/validation';
import { customToast } from '../utils/toast';

const { height } = Dimensions.get('window');
const PHONE_INPUT_ACCESSORY_ID = 'loginPhoneInput';

const LoginScreen = ({ navigation }) => {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    Keyboard.dismiss();
    setError('');

    const phoneResult = validatePhone(mobile);
    if (!phoneResult.valid) {
      setError(phoneResult.error);
      customToast(phoneResult.error, 'error');
      return;
    }

    setLoading(true);
    const result = await requestOtp(phoneResult.value);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      // API errors already toast from api/client; toast again only if needed
      return;
    }

    if (result.message) {
      customToast(result.message, 'success');
    }

    navigation.navigate('Otp', {
      phone: result.phone,
      otp: result.otp,
      retryAfterSeconds: result.retryAfterSeconds ?? 30,
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#7C5CFF', '#8B6CFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <View style={styles.circleLeft} />
        <View style={styles.circleRight} />

        <View style={styles.logoContainer}>
          <Text style={styles.logoA}>A</Text>
          <View style={styles.star1} />
          <View style={styles.star2} />
        </View>

        <Text style={styles.brand}>Artsy ✨</Text>
        <Text style={styles.tagline}>Discover & Book Amazing Artists</Text>
        <Text style={styles.subTagline}>
          Singers • DJs • Dancers • Anchors • Painters
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              <Text style={styles.title}>Enter your mobile number</Text>
              <Text style={styles.subtitle}>
                We'll send you a verification code
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.country}>🇮🇳  +91</Text>
                <View style={styles.separator} />
                <TextInput
                  value={mobile}
                  onChangeText={text => {
                    setMobile(text.replace(/\D/g, '').slice(0, 10));
                    if (error) setError('');
                  }}
                  keyboardType="number-pad"
                  placeholder="98765 43210"
                  placeholderTextColor="#C5CAD6"
                  style={styles.input}
                  maxLength={10}
                  editable={!loading}
                  inputAccessoryViewID={
                    Platform.OS === 'ios' ? PHONE_INPUT_ACCESSORY_ID : undefined
                  }
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                  <Text style={styles.stat}>⭐ 10,000+ Events Booked</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.stat}>🎭 500+ Verified Artists</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.stat}>🏆 Trusted Across Bangalore</Text>
                </View>
              </View>

              <View style={styles.categories}>
                <Text style={styles.category}>🎤 Singer</Text>
                <Text style={styles.category}>🎧 DJ</Text>
                <Text style={styles.category}>🎭 Actor</Text>
                <Text style={styles.category}>🎨 Painter</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>

          <Text style={styles.terms}>
            By continuing, you agree to our{' '}
            <Text style={styles.link}>Terms of Service</Text> &{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleContinue}
            disabled={loading}>
            <LinearGradient
              colors={['#7C5CFF', '#8B6CFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.button, loading && styles.buttonDisabled]}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Continue →</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={PHONE_INPUT_ACCESSORY_ID}>
          <View style={styles.keyboardAccessory}>
            <TouchableOpacity
              onPress={Keyboard.dismiss}
              style={styles.keyboardDoneButton}>
              <Text style={styles.keyboardDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    height: height * 0.34,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  circleLeft: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
    left: -50,
    top: 30,
  },
  circleRight: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.08)',
    right: -70,
    top: 40,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  logoA: {
    fontSize: 48,
    fontWeight: '800',
    color: '#7C5CFF',
  },
  star1: {
    position: 'absolute',
    top: 18,
    right: 15,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7C5CFF',
  },
  star2: {
    position: 'absolute',
    top: 28,
    right: 28,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#7C5CFF',
  },
  brand: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: '800',
  },
  tagline: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  subTagline: {
    color: 'rgba(255,255,255,0.75)',
    marginTop: 10,
    fontSize: 14,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  keyboardAccessory: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  keyboardDoneButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  keyboardDoneText: {
    color: '#7C5CFF',
    fontSize: 17,
    fontWeight: '700',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 12,
  },
  inputContainer: {
    height: 64,
    backgroundColor: '#FFF',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 28,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
  },
  country: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  separator: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  errorText: {
    marginTop: 10,
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    marginTop: 28,
  },
  statRow: {
    marginBottom: 10,
  },
  stat: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '600',
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 28,
  },
  category: {
    marginRight: 18,
    marginBottom: 12,
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  terms: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 18,
  },
  link: {
    color: '#7C5CFF',
    fontWeight: '700',
  },
  button: {
    height: 62,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
});

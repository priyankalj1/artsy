import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { USER_ROLES } from '../constants/auth';
import { selectRole } from '../auth/authService';
import { colors } from '../theme/colors';

const ROLE_OPTIONS = [
  {
    role: USER_ROLES.USER,
    emoji: '🎉',
    title: 'Customer',
    description:
      'Discover and book verified artists for weddings, parties and corporate events.',
    cta: 'Find Artists',
    accent: '#6C63FF',
  },
  {
    role: USER_ROLES.ARTIST,
    emoji: '🎭',
    title: 'Artist',
    description:
      'Showcase your talent, build your portfolio, and get booked for premium events.',
    cta: 'Grow My Career',
    accent: '#8B5CF6',
  },
];

export default function RoleSelectionScreen({ route, navigation }) {
  const { phone } = route.params ?? {};
  const [loadingRole, setLoadingRole] = useState(null);
  const [error, setError] = useState('');

  const handleSelect = async role => {
    setError('');
    setLoadingRole(role);

    const result = await selectRole(role);
    setLoadingRole(null);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (role === USER_ROLES.USER) {
      navigation.replace('OnboardingStatus');
      return;
    }

    navigation.replace('OnboardingStatus');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Almost there</Text>
          <Text style={styles.title}>I am a...</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.cards}>
          {ROLE_OPTIONS.map(option => {
            const isLoading = loadingRole === option.role;
            return (
              <TouchableOpacity
                key={option.role}
                style={[styles.card, loadingRole && styles.cardDisabled]}
                onPress={() => handleSelect(option.role)}
                activeOpacity={0.9}
                disabled={!!loadingRole}>
                <View
                  style={[
                    styles.emojiBox,
                    { backgroundColor: `${option.accent}18` },
                  ]}>
                  <Text style={styles.emoji}>{option.emoji}</Text>
                </View>
                <Text style={styles.cardTitle}>{option.title}</Text>
                <Text style={styles.cardDescription}>{option.description}</Text>
                {isLoading ? (
                  <ActivityIndicator
                    color={option.accent}
                    style={styles.loader}
                  />
                ) : (
                  <Text style={[styles.cardCta, { color: option.accent }]}>
                    {option.cta} →
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipEmoji}>💡</Text>
          <Text style={styles.tipText}>
            Artists earn ₹8,000–₹80,000+ per event. Join 500+ verified artists in
            Bangalore.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 28,
  },
  eyebrow: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textDark,
    marginTop: 4,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  cards: {
    gap: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderRadius: 24,
    padding: 24,
  },
  cardDisabled: {
    opacity: 0.7,
  },
  emojiBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textDark,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 22,
  },
  cardCta: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 16,
  },
  loader: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 20,
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
  },
  tipEmoji: {
    fontSize: 18,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#B45309',
    fontWeight: '500',
    lineHeight: 20,
  },
});

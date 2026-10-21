import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYCHAIN_SERVICE = 'com.artistbooking.auth';
const LEGACY_TOKEN_KEY = '@artist_booking/auth_token';
const LEGACY_USER_KEY = '@artist_booking/auth_user';

/**
 * Persist auth securely in the device Keychain / Keystore.
 * Falls back to AsyncStorage only if Keychain is unavailable.
 */
export async function saveSecureAuth({ token, user }) {
  if (!token) {
    await clearSecureAuth();
    return;
  }

  const payload = JSON.stringify({
    token,
    user: user || null,
  });

  try {
    await Keychain.setGenericPassword('session', payload, {
      service: KEYCHAIN_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    // Clean legacy plain storage once Keychain write succeeds
    await AsyncStorage.multiRemove([LEGACY_TOKEN_KEY, LEGACY_USER_KEY]);
    return;
  } catch {
    // Fallback for environments where Keychain isn't linked yet
    await AsyncStorage.setItem(LEGACY_TOKEN_KEY, token);
    if (user) {
      await AsyncStorage.setItem(LEGACY_USER_KEY, JSON.stringify(user));
    }
  }
}

export async function loadSecureAuth() {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });

    if (credentials?.password) {
      const parsed = JSON.parse(credentials.password);
      if (parsed?.token) {
        return {
          token: parsed.token,
          user: parsed.user || null,
        };
      }
    }
  } catch {
    // continue to legacy fallback
  }

  try {
    const [token, userRaw] = await AsyncStorage.multiGet([
      LEGACY_TOKEN_KEY,
      LEGACY_USER_KEY,
    ]);
    const storedToken = token?.[1];
    if (!storedToken) {
      return null;
    }

    let user = null;
    try {
      user = userRaw?.[1] ? JSON.parse(userRaw[1]) : null;
    } catch {
      user = null;
    }

    // Migrate legacy token into Keychain when possible
    await saveSecureAuth({ token: storedToken, user });

    return { token: storedToken, user };
  } catch {
    return null;
  }
}

export async function clearSecureAuth() {
  try {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
  } catch {
    // ignore
  }

  try {
    await AsyncStorage.multiRemove([LEGACY_TOKEN_KEY, LEGACY_USER_KEY]);
  } catch {
    // ignore
  }
}

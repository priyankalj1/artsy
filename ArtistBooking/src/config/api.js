import { NativeModules, Platform } from 'react-native';

/**
 * Resolve the machine hosting Metro/API.
 * - Physical device: uses the same LAN IP Metro already uses (e.g. 10.17.x.x)
 * - Android emulator: 10.0.2.2 (or MANUAL_LAN_IP)
 * - iOS simulator: 127.0.0.1 when Metro is on localhost
 *
 * Update MANUAL_LAN_IP when your Wi‑Fi IP changes (`ipconfig getifaddr en0`).
 */
const MANUAL_LAN_IP = '10.17.90.240';

function getDevHost() {
  const scriptURL = NativeModules.SourceCode?.scriptURL || '';
  const match = scriptURL.match(/https?:\/\/([^/:]+)(?::\d+)?/);
  const host = match?.[1];

  const isLoopback =
    !host || host === 'localhost' || host === '127.0.0.1';

  // Metro already advertised a real LAN / emulator host — prefer it.
  if (!isLoopback) {
    if (host === '10.0.2.2') {
      return MANUAL_LAN_IP || '10.0.2.2';
    }
    return host;
  }

  // Loopback Metro URL:
  // - iOS Simulator can hit the API on 127.0.0.1
  // - Physical devices must use the Mac LAN IP
  if (Platform.OS === 'ios') {
    // If you run on a physical iPhone and scriptURL is somehow localhost,
    // MANUAL_LAN_IP is the fallback that actually works.
    return MANUAL_LAN_IP || '127.0.0.1';
  }

  // Android physical device / emulator
  return MANUAL_LAN_IP || '10.0.2.2';
}

export const API_HOST = getDevHost();
export const API_PORT = 5050;
export const API_BASE_URL = `http://${API_HOST}:${API_PORT}/api`;

if (__DEV__) {
  console.log('[api] API_BASE_URL =', API_BASE_URL);
}

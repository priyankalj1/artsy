import { NativeModules, Platform } from 'react-native';

/**
 * Resolve the machine hosting Metro/API.
 * - Physical device: uses the same LAN IP Metro already uses (e.g. 192.168.x.x)
 * - Android emulator: falls back to 10.0.2.2
 * - iOS simulator: falls back to 127.0.0.1
 */
function getDevHost() {
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  // Example: http://192.168.0.108:8081/index.bundle?platform=ios&dev=true
  if (scriptURL) {
    const match = scriptURL.match(/https?:\/\/([^/:]+)(?::\d+)?/);
    const host = match?.[1];
    if (
      host &&
      host !== 'localhost' &&
      host !== '127.0.0.1' &&
      host !== '10.0.2.2'
    ) {
      return host;
    }
  }

  // Manual override if auto-detect fails (your current Mac LAN IP)
  // Update this if your Wi‑Fi IP changes (`ifconfig` → inet).
  const MANUAL_LAN_IP = '192.168.1.101';

  if (Platform.OS === 'android') {
    // Emulator loopback to host machine
    return MANUAL_LAN_IP || '10.0.2.2';
  }

  return MANUAL_LAN_IP || '127.0.0.1';
}

export const API_HOST = getDevHost();
export const API_PORT = 5050;
export const API_BASE_URL = `http://${API_HOST}:${API_PORT}/api`;

import { API_BASE_URL } from '../config/api';
import {
  clearSecureAuth,
  loadSecureAuth,
  saveSecureAuth,
} from '../auth/secureStorage';

let authToken = null;
let cachedUser = null;

export function getAuthToken() {
  return authToken;
}

export function getCachedUser() {
  return cachedUser;
}

/** In-memory only — use persistAuthSession to also write secure storage. */
export function setAuthToken(token) {
  authToken = token || null;
}

export async function persistAuthSession({ token, user } = {}) {
  authToken = token || authToken || null;
  if (user) {
    cachedUser = user;
  }

  if (!authToken) {
    cachedUser = null;
    await clearSecureAuth();
    return;
  }

  await saveSecureAuth({
    token: authToken,
    user: cachedUser,
  });
}

export async function clearAuthToken() {
  authToken = null;
  cachedUser = null;
  await clearSecureAuth();
}

export async function loadStoredAuthToken() {
  const stored = await loadSecureAuth();
  authToken = stored?.token || null;
  cachedUser = stored?.user || null;
  return authToken;
}

export class ApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  const bearer = token ?? authToken;
  if (bearer) {
    headers.Authorization = `Bearer ${bearer}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const err = new ApiError(
      `Unable to reach server at ${API_BASE_URL}. Check that ArtistBackend is running and your phone is on the same Wi‑Fi.`,
      { status: 0 },
    );
    throw err;
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    throw new ApiError(
      payload?.message || `Request failed (${response.status})`,
      { status: response.status, payload },
    );
  }

  return payload;
}

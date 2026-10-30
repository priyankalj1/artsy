import { API_BASE_URL } from '../config/api';
import {
  clearSecureAuth,
  loadSecureAuth,
  saveSecureAuth,
} from '../auth/secureStorage';
import { customToast } from '../utils/toast';

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

export async function apiRequest(
  path,
  { method = 'GET', body, token, silent = false } = {},
) {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  const bearer = token ?? authToken;
  if (bearer) {
    headers.Authorization = `Bearer ${bearer}`;
  }

  const notify = message => {
    if (!silent) {
      customToast(message, 'error');
    }
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const err = new ApiError(
      'Unable to reach server. Check that the backend is running and your phone is on the same Wi‑Fi.',
      { status: 0 },
    );
    notify(err.message);
    throw err;
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    const message =
      payload?.message || `Request failed (${response.status})`;
    notify(message);
    throw new ApiError(message, { status: response.status, payload });
  }

  return payload;
}

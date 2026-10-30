import { USER_ROLES } from '../constants/auth';
import {
  requestOtpApi,
  verifyOtpApi,
  selectRoleApi,
  fetchMeApi,
  saveOnboardingProgressApi,
} from '../api/auth';
import { onboardCustomerApi, onboardArtistApi } from '../api/users';
import {
  ApiError,
  clearAuthToken,
  getAuthToken,
  getCachedUser,
  loadStoredAuthToken,
  persistAuthSession,
  setAuthToken,
} from '../api/client';
import {
  validatePhone,
  validateOtp,
  validateRole,
  validateCustomerOnboard,
  validateArtistOnboard,
} from '../utils/validation';

let currentSession = null;
let pendingPhone = null;
let pendingRole = null;

function buildSession({ user, customer, artist, token, onboarding }) {
  return {
    isAuthenticated: true,
    token: token || getAuthToken(),
    onboarding: onboarding || null,
    user: {
      user_id: user?.user_id,
      name: user?.name,
      phone: user?.phone,
      role: user?.role,
      is_onboarded: user?.is_onboarded,
      onboarding_step: user?.onboarding_step,
      ...(customer
        ? {
            interests: customer.interests,
            location: customer.location,
            customer_id: customer.customer_id,
          }
        : {}),
      ...(artist || {}),
    },
  };
}

async function setCurrentSession(session) {
  currentSession = session;
  if (session?.token) {
    await persistAuthSession({
      token: session.token,
      user: session.user,
    });
  }
  return currentSession;
}

export function getSession() {
  if (currentSession?.isAuthenticated) {
    return currentSession;
  }

  return {
    isAuthenticated: false,
    user: null,
    token: null,
  };
}

/**
 * On app launch: load JWT from secure storage, validate with /auth/me,
 * and restore session so the user skips login until logout.
 */
export async function restoreSession() {
  const token = await loadStoredAuthToken();
  if (!token) {
    currentSession = null;
    return null;
  }

  const cachedUser = getCachedUser();

  try {
    const result = await fetchMeApi({ silent: true });
    const user = result?.data?.user;
    const onboarding = result?.data?.onboarding;

    return setCurrentSession(
      buildSession({
        user,
        customer: result?.data?.customer,
        artist: result?.data?.artist,
        token,
        onboarding,
      }),
    );
  } catch (error) {
    // Only wipe auth on real auth failures (expired/invalid token).
    const unauthorized =
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403);

    if (unauthorized) {
      await clearAuthToken();
      currentSession = null;
      return null;
    }

    // Network / server down: keep token and restore from cached user.
    if (cachedUser) {
      setAuthToken(token);
      currentSession = buildSession({ user: cachedUser, token });
      return currentSession;
    }

    return null;
  }
}

/** Used after OTP. Enters the main app only when onboarding is complete. */
export async function establishSessionFromAuth(user, token, extras = {}) {
  const session = buildSession({
    user,
    token: token || getAuthToken(),
    onboarding: extras.onboarding,
    customer: extras.customer,
    artist: extras.artist,
  });

  if (token || user) {
    await persistAuthSession({ token: session.token, user: session.user });
  }

  if (!user?.is_onboarded) {
    currentSession = session;
    return session;
  }

  return setCurrentSession(session);
}

export async function requestOtp(phone) {
  const phoneResult = validatePhone(phone);
  if (!phoneResult.valid) {
    return { success: false, error: phoneResult.error };
  }

  try {
    const result = await requestOtpApi(phoneResult.value);
    pendingPhone = phoneResult.value;
    return {
      success: true,
      phone: phoneResult.value,
      otp: result?.data?.otp,
      message: result?.message,
      retryAfterSeconds: result?.data?.retry_after_seconds ?? 60,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      retryAfterSeconds: error?.payload?.data?.retry_after_seconds,
    };
  }
}

export async function verifyOtpCode(phone, otp) {
  const phoneResult = validatePhone(phone || pendingPhone);
  if (!phoneResult.valid) {
    return { success: false, error: phoneResult.error };
  }

  const otpResult = validateOtp(otp);
  if (!otpResult.valid) {
    return { success: false, error: otpResult.error };
  }

  try {
    const result = await verifyOtpApi(phoneResult.value, otpResult.value);
    pendingPhone = phoneResult.value;
    pendingRole = result?.data?.user?.role || null;

    const token = result?.data?.token;
    const user = result?.data?.user;
    if (token) {
      await persistAuthSession({ token, user });
    }

    return {
      success: true,
      phone: phoneResult.value,
      user,
      token,
      onboarding: result?.data?.onboarding,
      draft: result?.data?.draft,
      message: result?.message,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function selectRole(role) {
  const roleResult = validateRole(role);
  if (!roleResult.valid) {
    return { success: false, error: roleResult.error };
  }

  if (!pendingPhone && !getAuthToken()) {
    return { success: false, error: 'Please verify your OTP first.' };
  }

  try {
    const result = await selectRoleApi(roleResult.value);
    pendingRole = roleResult.value;

    const user = result?.data?.user;
    if (user) {
      await persistAuthSession({ token: getAuthToken(), user });
    }

    return {
      success: true,
      phone: pendingPhone || user?.phone,
      role: roleResult.value,
      user,
      onboarding: result?.data?.onboarding,
      draft: result?.data?.draft,
      message: result?.message,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function onboardCustomer(profile = {}) {
  const validation = validateCustomerOnboard(profile);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  if (!getAuthToken()) {
    return { success: false, error: 'Please verify your OTP first.' };
  }

  try {
    const result = await onboardCustomerApi(validation.value);
    pendingRole = USER_ROLES.USER;

    await setCurrentSession(
      buildSession({
        user: result?.data?.user,
        customer: result?.data?.customer,
        token: result?.data?.token,
      }),
    );

    pendingPhone = null;
    pendingRole = null;

    return {
      success: true,
      session: currentSession,
      message: result?.message,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function onboardArtist(profile = {}) {
  const validation = validateArtistOnboard(profile);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  if (!getAuthToken()) {
    return { success: false, error: 'Please verify your OTP first.' };
  }

  try {
    const result = await onboardArtistApi({
      ...validation.value,
      profilePhoto: profile.profilePhoto || null,
      videoInterview: profile.videoInterview || null,
    });
    pendingRole = USER_ROLES.ARTIST;

    await setCurrentSession(
      buildSession({
        user: result?.data?.user,
        artist: result?.data?.artist,
        token: result?.data?.token,
      }),
    );

    pendingPhone = null;
    pendingRole = null;

    return {
      success: true,
      session: currentSession,
      message: result?.message,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function fetchOnboardingStatus() {
  if (!getAuthToken()) {
    return { success: false, error: 'Please verify your OTP first.' };
  }

  try {
    const result = await fetchMeApi();
    return {
      success: true,
      user: result?.data?.user,
      onboarding: result?.data?.onboarding,
      draft: result?.data?.draft,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function saveOnboardingProgress(step, data = {}) {
  if (!getAuthToken()) {
    return { success: false, error: 'Please verify your OTP first.' };
  }

  try {
    const result = await saveOnboardingProgressApi(step, data);
    if (result?.data?.user) {
      await persistAuthSession({
        token: getAuthToken(),
        user: result.data.user,
      });
    }
    return {
      success: true,
      user: result?.data?.user,
      onboarding: result?.data?.onboarding,
      draft: result?.data?.draft,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function logout() {
  currentSession = null;
  pendingPhone = null;
  pendingRole = null;
  await clearAuthToken();
}

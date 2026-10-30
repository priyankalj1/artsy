import { apiRequest, setAuthToken } from './client';

export async function requestOtpApi(phone) {
  return apiRequest('/auth/otp/request', {
    method: 'POST',
    body: { phone },
  });
}

export async function verifyOtpApi(phone, otp) {
  const result = await apiRequest('/auth/otp/verify', {
    method: 'POST',
    body: { phone, otp },
  });

  if (result?.data?.token) {
    setAuthToken(result.data.token);
  }

  return result;
}

export async function selectRoleApi(role) {
  const result = await apiRequest('/auth/role', {
    method: 'POST',
    body: { role },
  });

  if (result?.data?.token) {
    setAuthToken(result.data.token);
  }

  return result;
}

export async function fetchMeApi({ silent = false } = {}) {
  return apiRequest('/auth/me', { silent });
}

export async function saveOnboardingProgressApi(step, data = {}) {
  return apiRequest('/auth/onboarding/progress', {
    method: 'POST',
    body: { step, data },
  });
}

import { apiRequest, setAuthToken } from './client';

export async function onboardCustomerApi(payload) {
  const result = await apiRequest('/users/onboard', {
    method: 'POST',
    body: payload,
  });

  if (result?.data?.token) {
    setAuthToken(result.data.token);
  }

  return result;
}

export async function getMyCustomerProfileApi() {
  return apiRequest('/users/me');
}

export async function onboardArtistApi(payload) {
  const result = await apiRequest('/artists/onboard', {
    method: 'POST',
    body: payload,
  });

  if (result?.data?.token) {
    setAuthToken(result.data.token);
  }

  return result;
}

import { apiRequest } from './client';

export async function fetchAppConfigApi() {
  return apiRequest('/config');
}

import { apiRequest } from './client';

export async function fetchMyBookingsApi(status) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  return apiRequest(`/bookings${qs}`);
}

export async function createBookingApi(payload) {
  return apiRequest('/bookings', {
    method: 'POST',
    body: payload,
  });
}

export async function updateBookingStatusApi(id, status) {
  return apiRequest(`/bookings/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export async function fetchBookingByIdApi(id) {
  return apiRequest(`/bookings/${id}`);
}

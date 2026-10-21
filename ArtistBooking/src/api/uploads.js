import { API_BASE_URL } from '../config/api';
import { getAuthToken } from './client';

const DOC_TYPE_MAP = {
  profile: 'profile',
  portfolio: 'portfolio_photo',
  portfolioVideo: 'portfolio_video',
  id: 'id_image',
  photo: 'selfie',
  selfie: 'selfie',
  videoInterview: 'video_interview',
};

const UPLOAD_TIMEOUT_MS = 20000;

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

function guessMime(uri = '', fallback = 'image/jpeg') {
  const lower = String(uri).toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  return fallback;
}

/**
 * Upload a local device file to the backend.
 * Stores file under uploads/artists/{userId}/... and inserts a documents row.
 * Returns associate-style { path, fullUrl }.
 */
export async function uploadDocumentApi(localUri, doctype, options = {}) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please sign in before uploading images.');
  }

  const docType = DOC_TYPE_MAP[doctype] || doctype;
  if (!docType) {
    throw new Error('Missing document type for upload.');
  }

  if (!localUri) {
    throw new Error('No image selected to upload.');
  }

  const name =
    options.fileName ||
    `${docType}-${Date.now()}.${guessMime(localUri).includes('video') ? 'mp4' : 'jpg'}`;

  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    type: options.mimeType || guessMime(localUri),
    name,
  });
  formData.append('doc_type', docType);

  let response;
  try {
    response = await withTimeout(
      fetch(`${API_BASE_URL}/uploads`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }),
      UPLOAD_TIMEOUT_MS,
      'Upload timed out. Please try again.',
    );
  } catch (error) {
    if (error?.message?.includes('timed out')) {
      throw error;
    }
    throw new Error(
      'Unable to upload file. Check your connection to the server.',
    );
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || `Upload failed (${response.status})`);
  }

  return {
    path: payload.data.path || payload.data.documentUrl,
    fullUrl: payload.data.fullUrl || payload.data.fullDocumentUrl,
    documentId: payload.data.document_id,
    documentType: payload.data.document_type,
  };
}

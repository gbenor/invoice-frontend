const STORAGE_KEY = 'invoice_api_key';
const DEFAULT_API_URL = 'https://invoice-production-a0d7.up.railway.app';
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
const API_BASE_PATH = `/${(import.meta.env.VITE_API_BASE_PATH || '').replace(/^\/+|\/+$/g, '')}`.replace(/^\/$/, '');
const DEFAULT_KEY = import.meta.env.VITE_API_KEY || '';
const AUTH_MODE = (import.meta.env.VITE_API_AUTH_MODE || 'bearer').toLowerCase();
const AUTH_QUERY_PARAM = import.meta.env.VITE_API_AUTH_QUERY_PARAM || 'api_key';
const AUTH_HEADER_NAME = import.meta.env.VITE_API_AUTH_HEADER_NAME || 'x-api-key';

export const EXPENSE_TYPES = [
  'clinic_tools',
  'client_support',
  'clinic_hygiene',
  'office_admin',
  'communication',
  'clinical_supervision',
  'clinical_training',
  'car_expenses',
  'travel_abroad',
  'rent_and_bills',
  'other'
];

export const STATUS_VALUES = ['draft', 'confirmed'];
export const SOURCE_VALUES = ['camera_invoice', 'monzo_csv', 'amazon_csv'];

export function setApiKey(key) {
  const trimmed = key.trim();
  if (trimmed) localStorage.setItem(STORAGE_KEY, trimmed);
  else localStorage.removeItem(STORAGE_KEY);
}

export function getApiKey() {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_KEY;
}

export function clearApiKey() {
  localStorage.removeItem(STORAGE_KEY);
}

function isHeaderAuth() {
  return AUTH_MODE === 'bearer' || AUTH_MODE === 'header' || AUTH_MODE === 'x-api-key';
}

function isQueryAuth() {
  return AUTH_MODE === 'query';
}

function getBearerToken(key) {
  return key.replace(/^Bearer\s+/i, '');
}

function buildHeaders(extra = {}) {
  const key = getApiKey();
  const authHeader = AUTH_MODE === 'bearer'
    ? { Authorization: `Bearer ${getBearerToken(key)}` }
    : { [AUTH_HEADER_NAME]: key };

  return {
    ...(key && isHeaderAuth() ? authHeader : {}),
    ...extra
  };
}

function buildUrl(path) {
  const url = new URL(`${API_URL}${API_BASE_PATH}${path}`);
  const key = getApiKey();

  if (key && isQueryAuth()) {
    url.searchParams.set(AUTH_QUERY_PARAM, key);
  }

  return url.toString();
}

function mapErrorMessage(status, fallback) {
  const byStatus = {
    400: 'Unsupported file format, MIME type, or invalid request data.',
    401: 'Missing or invalid API key. Use Authorization: Bearer <key>',
    403: 'Missing or invalid API key. Use Authorization: Bearer <key>',
    404: 'Invoice not found.',
    405: 'Backend route does not allow this request method. Cross-origin JSON PUT requests still require the backend to allow CORS OPTIONS preflights.',
    413: 'File too large.',
    500: 'Server error while processing request.',
    502: 'Upstream service failed. Please try again.',
    504: 'Processing timeout. Please retry upload.'
  };
  return byStatus[status] || fallback;
}

function buildNetworkErrorMessage(error) {
  const message = error?.message || '';
  const failedToFetch = error instanceof TypeError || /failed to fetch|networkerror/i.test(message);

  if (!failedToFetch) return message || 'Network request failed.';

  return 'Could not reach the backend from the browser. If the backend log shows OPTIONS 405, enable CORS preflight handling for the frontend origin and allow the Authorization header.';
}

async function request(path, options = {}) {
  let res;

  try {
    res = await fetch(buildUrl(path), {
      ...options,
      headers: buildHeaders(options.headers)
    });
  } catch (error) {
    throw new Error(buildNetworkErrorMessage(error));
  }

  if (!res.ok) {
    const body = await res.text();
    const message = mapErrorMessage(res.status, body || `Request failed: ${res.status}`);
    const error = new Error(message);
    error.code = res.status;
    throw error;
  }

  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json') ? res.json() : null;
}

function buildFileFormData(file) {
  const formData = new FormData();
  formData.append('file', file);
  return formData;
}

export async function uploadInvoice(file) {
  return request('/upload', {
    method: 'POST',
    body: buildFileFormData(file)
  });
}

export async function debugUploadInvoice(file) {
  return request('/debug-upload', {
    method: 'POST',
    body: buildFileFormData(file)
  });
}

export async function uploadMonzoCsv(file, rows) {
  const path = rows ? `/upload/monzo-csv?rows=${encodeURIComponent(rows)}` : '/upload/monzo-csv';
  return request(path, {
    method: 'POST',
    body: buildFileFormData(file)
  });
}

export async function uploadAmazonCsv(file, rows) {
  const path = rows ? `/upload/amazon-csv?rows=${encodeURIComponent(rows)}` : '/upload/amazon-csv';
  return request(path, {
    method: 'POST',
    body: buildFileFormData(file)
  });
}

export async function sendInvoice(file) {
  return request('/invoice/send', {
    method: 'POST',
    body: buildFileFormData(file)
  });
}

export function getInvoice(id) {
  return request(`/invoice/${id}`);
}

export function updateInvoice(id, data) {
  return request(`/invoice/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}

export function confirmInvoice(id) {
  return request(`/invoice/${id}/confirm`, {
    method: 'POST'
  });
}

export function getLatestInvoices(n = 10) {
  const parsed = Number(n);
  const safeN = Number.isFinite(parsed) ? Math.min(100, Math.max(1, Math.trunc(parsed))) : 10;
  return request(`/invoices/latest?n=${safeN}`);
}

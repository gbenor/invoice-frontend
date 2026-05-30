const STORAGE_KEY = 'invoice_api_key';
const DEFAULT_API_URL = 'https://invoice-production-a0d7.up.railway.app';
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
const DEFAULT_KEY = import.meta.env.VITE_API_KEY || '';

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

function buildHeaders(extra = {}) {
  const key = getApiKey();
  return {
    ...(key ? { Authorization: `Bearer ${key}` } : {}),
    ...extra
  };
}

function mapErrorMessage(status, fallback) {
  const byStatus = {
    400: 'Unsupported file format, MIME type, or invalid request data.',
    401: 'Unauthorized - invalid or missing API key.',
    403: 'Unauthorized - invalid or missing API key.',
    404: 'Invoice not found.',
    413: 'File too large.',
    500: 'Server error while processing request.',
    502: 'Upstream service failed. Please try again.',
    504: 'Processing timeout. Please retry upload.'
  };
  return byStatus[status] || fallback;
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers)
  });

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

export async function uploadInvoice(file) {
  const formData = new FormData();
  formData.append('file', file);

  return request('/upload', {
    method: 'POST',
    body: formData
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

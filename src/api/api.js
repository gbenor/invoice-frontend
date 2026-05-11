const STORAGE_KEY = 'invoice_api_key';
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const DEFAULT_KEY = import.meta.env.VITE_API_KEY || '';

export function setApiKey(key) {
  localStorage.setItem(STORAGE_KEY, key);
}

export function getApiKey() {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_KEY;
}

function buildHeaders(extra = {}) {
  const key = getApiKey();
  return {
    'x-api-key': key,
    ...extra
  };
}

async function request(path, options = {}) {
  if (!API_URL) {
    throw new Error('Missing VITE_API_URL configuration');
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers)
  });

  if (res.status === 401) {
    const error = new Error('Unauthorized - invalid key');
    error.code = 401;
    throw error;
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Request failed: ${res.status}`);
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

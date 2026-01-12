import { auth } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

export async function apiFetch(endpoint: string, options: RequestOptions = {}) {
  const token = auth.getToken();
  
  const headers: Record<string, string> = {
    ...options.headers,
  };

  // Only set application/json if not FormData and not explicitly overriden
  if (!(options.body instanceof FormData) && options.headers?.['Content-Type'] !== 'undefined') {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  // Remove the marker if present
  if (headers['Content-Type'] === 'undefined') {
    delete headers['Content-Type'];
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    auth.removeToken();
    window.location.href = '/admin/login';
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API Request Failed');
  }

  return response.json();
}

import { store } from '@/store';

const baseUrl = import.meta.env.VITE_BACKEND_URL;

const getAuthToken = (): string | null => {
  return store.getState().auth.token || sessionStorage.getItem('auth_token');
};

export const fetchWithJWT = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
  data?: Record<string, unknown>,
) => {
  const url   = `${baseUrl}/${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = { method, headers };

  if (method !== 'GET' && data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (response.status === 401) {
    const { logout } = await import('@/store/slices/auth/authSlice');
    store.dispatch(logout());
    throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
  }

  return response;
};

export const fetchConToken = (
  endpoint: string,
  data?: Record<string, unknown>,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
) => {
  return fetchWithJWT(endpoint, method, data);
};

export const fetchSinToken = (
  endpoint: string,
  data?: Record<string, unknown>,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
) => {
  const url = `${baseUrl}/${endpoint}`;

  if (method === 'GET') {
    return fetch(url);
  } else {
    return fetch(url, {
      method,
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify(data),
    });
  }
};

export const fetchCanvas = fetchConToken;

export const hasValidSession = (): boolean => {
  return !!getAuthToken();
};
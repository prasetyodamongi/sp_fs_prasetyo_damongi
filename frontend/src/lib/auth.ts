import { apiFetch } from './api';

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const saveToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

// Fungsi untuk decode token yang bisa dipakai ulang
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const getCurrentUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  const token = getToken();
  if (!token) return null;

  const payload = decodeToken(token);
  return payload?.userId || payload?.sub || null;
};

export const getCurrentUser = async (): Promise<{ userId: string; email: string; name: string }> => {
  const token = getToken();
  if (!token) throw new Error('No token');

  const user = await apiFetch<{ id: string; email: string; name: string }>(
    '/users/me',
    'GET',
    undefined,
    token
  );

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
  };
};
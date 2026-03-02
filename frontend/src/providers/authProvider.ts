import type { AuthProvider } from '@refinedev/core';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return { success: false, error: { name: 'LoginError', message: 'Invalid email or password' } };
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return { success: true, redirectTo: '/' };
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true, redirectTo: '/login' };
  },

  check: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return { authenticated: false, redirectTo: '/login' };
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { authenticated: false, redirectTo: '/login' };
      }

      return { authenticated: true };
    } catch {
      return { authenticated: false, redirectTo: '/login' };
    }
  },

  getIdentity: async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    const user = JSON.parse(userStr);
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  },

  getPermissions: async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    const user = JSON.parse(userStr);
    return user.role;
  },

  onError: async (error) => {
    if (error?.statusCode === 401) {
      return { logout: true, redirectTo: '/login' };
    }
    return { error };
  },
};

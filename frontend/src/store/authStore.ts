import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAdmin: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  init: () => void;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAdmin: false,

  setAuth: (user, token, refreshToken) => {
    const { password, ...safeUser } = user as any;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(safeUser));
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    }
    set({ user: safeUser as User, token, refreshToken: refreshToken || null, isAdmin: safeUser.role === 'admin' });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
    }
    set({ user: null, token: null, refreshToken: null, isAdmin: false });
    const cartStore = require('@/store/cartStore').useCartStore.getState();
    cartStore.setItems([]);
    window.location.href = '/auth/login';
  },

  init: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, token, refreshToken, isAdmin: user.role === 'admin' });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
      }
    }
  },

  refresh: async () => {
    const { refreshToken } = get();
    if (!refreshToken) {
      get().logout();
      return;
    }
    try {
      const { authApi } = await import('@/lib/api');
      const res = await authApi.refresh(refreshToken);
      const { user, accessToken, refreshToken: newRT } = res.data.data;
      get().setAuth(user, accessToken, newRT);
    } catch {
      get().logout();
    }
  },
}));
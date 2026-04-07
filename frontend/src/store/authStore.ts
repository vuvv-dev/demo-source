import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAdmin: false,

  setAuth: (user, token) => {
    // Strip password before storing (backend may return it)
    const { password, ...safeUser } = user as any;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(safeUser));
    }
    set({ user: safeUser as User, token, isAdmin: safeUser.role === 'admin' });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ user: null, token: null, isAdmin: false });
    // Also clear cart on logout
    const cartStore = require('@/store/cartStore').useCartStore.getState();
    cartStore.setItems([]);
    window.location.href = '/auth/login';
  },

  init: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr) as User;
          set({ user, token, isAdmin: user.role === 'admin' });
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
  },
}));
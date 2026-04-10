import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
const api = axios.create({ baseURL: API_BASE, timeout: 15000 });

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

// Attach token on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — attempt refresh token first
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve) => {
          refreshQueue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // No refresh token — redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('refreshToken');
          window.location.href = '/auth/login';
        }
        return Promise.reject(err);
      }

      try {
        const res = await api.post('/auth/refresh', {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        const { accessToken, refreshToken: newRT } = res.data.data;
        localStorage.setItem('token', accessToken);
        if (newRT) localStorage.setItem('refreshToken', newRT);

        // Retry all queued requests
        refreshQueue.forEach(cb => cb(accessToken));
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        // Refresh failed — clear all and redirect
        refreshQueue = [];
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('refreshToken');
          window.location.href = '/auth/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;

// ─── Auth ───────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken: string) => api.post('/auth/refresh', {}, {
    headers: { Authorization: `Bearer ${refreshToken}` },
  }),
};

// ─── Products ─────────────────────────────────────────────────────────────
export const productsApi = {
  list: (params?: any) => api.get('/products', { params }),
  detail: (idOrSlug: string) => api.get(`/products/${idOrSlug}`),
  adminList: (params?: any) => api.get('/products/admin/all', { params }),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.patch(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  // Variants
  createVariant: (productId: string, data: any) => api.post(`/products/${productId}/variants`, data),
  updateVariant: (variantId: string, data: any) => api.patch(`/products/variants/${variantId}`, data),
  deleteVariant: (variantId: string) => api.delete(`/products/variants/${variantId}`),
};

// ─── Categories ──────────────────────────────────────────────────────────
export const categoriesApi = {
  list: () => api.get('/categories'),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.patch(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// ─── Cart ─────────────────────────────────────────────────────────────────
export const cartApi = {
  get: () => api.get('/cart'),
  addItem: (data: any) => api.post('/cart/items', data),
  updateItem: (itemId: string, data: any) => api.patch(`/cart/items/${itemId}`, data),
  removeItem: (itemId: string) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete('/cart'),
};

// ─── Orders ───────────────────────────────────────────────────────────────
export const ordersApi = {
  create: (data: any) => api.post('/orders', data),
  list: (params?: any) => api.get('/orders', { params }),
  detail: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, data: any) => api.patch(`/orders/${id}/status`, data),
  cancel: (id: string) => api.patch(`/orders/${id}/cancel`),
};

// ─── Reviews ──────────────────────────────────────────────────────────────
export const reviewsApi = {
  list: (productId: string, params?: any) => api.get(`/products/${productId}/reviews`, { params }),
  create: (productId: string, data: any) => api.post(`/products/${productId}/reviews`, data),
};

// ─── Dashboard ─────────────────────────────────────────────────────────────
export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
};

// ─── Payments ──────────────────────────────────────────────────────────────
export const paymentsApi = {
  createCheckoutSession: (orderId: string) => api.post('/payments/create-checkout-session', { orderId }),
  getQRCode: (orderId: string) => api.get(`/payments/qr/${orderId}`),
  confirmPayment: (orderId: string) => api.patch(`/payments/confirm/${orderId}`),
};

// ─── Users ────────────────────────────────────────────────────────────────
export const usersApi = {
  list: (params?: any) => api.get('/users', { params }),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  updateProfile: (data: any) => api.patch('/users/profile', data),
};

// ─── Wishlist ──────────────────────────────────────────────────────────────
export const wishlistApi = {
  list: () => api.get('/wishlist'),
  add: (productId: string) => api.post(`/wishlist/${productId}`),
  remove: (productId: string) => api.delete(`/wishlist/${productId}`),
  check: (productId: string) => api.get(`/wishlist/${productId}/status`),
};

// ─── Addresses ─────────────────────────────────────────────────────────────
export const addressesApi = {
  list: () => api.get('/addresses'),
  create: (data: any) => api.post('/addresses', data),
  update: (id: string, data: any) => api.patch(`/addresses/${id}`, data),
  delete: (id: string) => api.delete(`/addresses/${id}`),
  setDefault: (id: string) => api.patch(`/addresses/${id}/default`),
};

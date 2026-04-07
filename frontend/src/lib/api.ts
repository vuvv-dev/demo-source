import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3001/api', timeout: 15000 });

// Attach token on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
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
};

// ─── Products ─────────────────────────────────────────────────────────────
export const productsApi = {
  list: (params?: any) => api.get('/products', { params }),
  detail: (idOrSlug: string) => api.get(`/products/${idOrSlug}`),
  adminList: (params?: any) => api.get('/products/admin/all', { params }),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.patch(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
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

// ─── Users ────────────────────────────────────────────────────────────────
export const usersApi = {
  list: (params?: any) => api.get('/users', { params }),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  updateProfile: (data: any) => api.patch('/users/profile', data),
};

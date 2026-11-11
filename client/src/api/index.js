import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Response interceptor — unwrap data, handle auth errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong.';
    const status = error.response?.status;

    // Redirect to login on 401 (except the auth/me check)
    if (status === 401 && !error.config.url.includes('/auth/me')) {
      // Trigger app-level logout
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }

    return Promise.reject({ message, status, errors: error.response?.data?.errors });
  }
);

// ─── Auth API ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// ─── Profile API ──────────────────────────────────────────────────────────────
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.patch('/profile', data),
  updateImage: (imageUrl) => api.patch('/profile/image', { imageUrl }),
  getTips: () => api.get('/profile/tips'),
  saveOnboarding: (data) => api.post('/profile/onboarding', data),
  uploadResume: (formData) => api.post('/profile/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ─── Opportunities API ─────────────────────────────────────────────────────────
export const opportunitiesAPI = {
  list: (params) => api.get('/opportunities', { params }),
  get: (id) => api.get(`/opportunities/${id}`),
  recommended: () => api.get('/opportunities/recommended'),
  getMatch: (id) => api.get(`/opportunities/${id}/match`),
  explain: (id) => api.get(`/opportunities/${id}/explain`),
  // Admin
  create: (data) => api.post('/opportunities', data),
  update: (id, data) => api.patch(`/opportunities/${id}`, data),
  delete: (id) => api.delete(`/opportunities/${id}`),
};

// ─── Saved API ─────────────────────────────────────────────────────────────────
export const savedAPI = {
  list: (params) => api.get('/saved', { params }),
  save: (id) => api.post(`/opportunities/${id}/save`),
  unsave: (id) => api.delete(`/opportunities/${id}/save`),
};

// ─── Applications API ──────────────────────────────────────────────────────────
export const applicationsAPI = {
  list: (params) => api.get('/applications', { params }),
  stats: () => api.get('/applications/stats'),
  get: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.patch(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
};

// ─── Notifications API ─────────────────────────────────────────────────────────
export const notificationsAPI = {
  list: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}`),
  markAllRead: () => api.patch('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ─── Admin API ─────────────────────────────────────────────────────────────────
export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  opportunities: (params) => api.get('/admin/opportunities', { params }),
  users: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  logs: (params) => api.get('/admin/logs', { params }),
  getIngestionSources: () => api.get('/admin/ingest/sources'),
  ingestBatch: (data) => api.post('/admin/ingest/batch', data),
};

export default api;

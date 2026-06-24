import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.potupartners.site';

// ─── Base Axios instance ──────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL:         API_URL,
  withCredentials: true,
  headers:         { 'Content-Type': 'application/json' },
  timeout:         15_000,
});

// ─── Request interceptor — attach access token ────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — refresh token on 401 ─────────────────────────────
let refreshing = false;
let queue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (refreshing) {
        return new Promise(resolve => {
          queue.push(token => {
            original.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      original._retry = true;
      refreshing = true;

      try {
        const { data } = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);
        queue.forEach(cb => cb(newToken));
        queue = [];
        return api(original);
      } catch {
        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') window.location.href = '/';
        return Promise.reject(error);
      } finally {
        refreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth endpoints ───────────────────────────────────────────────────────────
export const authService = {
  login:    (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  register: (email: string, password: string, fullName: string) =>
    api.post('/api/auth/register', { email, password, fullName }),
  logout:   () => api.post('/api/auth/logout'),
  me:       () => api.get('/api/auth/me'),
  refresh:  () => api.post('/api/auth/refresh'),
};

// ─── User endpoints ───────────────────────────────────────────────────────────
export const userService = {
  getStaff:   () => api.get('/api/users/staff'),
  getById:    (id: string) => api.get(`/api/users/${id}`),
  updateSelf: (data: Partial<{ fullName: string; displayName: string }>) =>
    api.patch('/api/users/me', data),
};

// ─── Conversation endpoints ───────────────────────────────────────────────────
export const conversationService = {
  createOrGet: (participantId: string | null, isAiChat: boolean) =>
    api.post('/api/conversations', { participantId, isAiChat }),
  list:        () => api.get('/api/conversations'),
  getById:     (id: string) => api.get(`/api/conversations/${id}`),
  delete:      (id: string) => api.delete(`/api/conversations/${id}`),
};

// ─── Message endpoints ────────────────────────────────────────────────────────
export const messageService = {
  list:     (conversationId: string, page = 1, limit = 50) =>
    api.get(`/api/conversations/${conversationId}/messages`, {
      params: { page, limit },
    }),
  delete:   (messageId: string) => api.delete(`/api/messages/${messageId}`),
  markRead: (conversationId: string) =>
    api.post(`/api/messages/${conversationId}/read`),
};

// ─── File endpoints ───────────────────────────────────────────────────────────
export const fileService = {
  upload: (file: File, conversationId: string, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append('file', file);
    form.append('conversationId', conversationId);
    return api.post('/api/files/upload', form, {
      headers:         { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    });
  },
  getUrl:  (fileId: string) => api.get(`/api/files/${fileId}/url`),
  delete:  (fileId: string) => api.delete(`/api/files/${fileId}`),
};

// ─── AI endpoints ─────────────────────────────────────────────────────────────
export const aiService = {
  query: (conversationId: string, message: string) =>
    api.post('/api/ai/query', { conversationId, message }),
};

// ─── Admin endpoints ──────────────────────────────────────────────────────────
export const adminService = {
  // Users
  listUsers:  () => api.get('/api/admin/users'),
  createUser: (data: { email: string; password: string; fullName: string; role: string; title?: string }) =>
    api.post('/api/admin/users', data),
  updateRole: (id: string, role: string) =>
    api.patch(`/api/admin/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.delete(`/api/admin/users/${id}`),

  // RAG documents
  listDocs:   () => api.get('/api/admin/rag-documents'),
  uploadDoc: (file: File, title: string, description?: string, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append('file', file);
    form.append('title', title);
    if (description) form.append('description', description);
    return api.post('/api/admin/rag-documents', form, {
      headers:         { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    });
  },
  deleteDoc: (id: string) => api.delete(`/api/admin/rag-documents/${id}`),
};

export default api;
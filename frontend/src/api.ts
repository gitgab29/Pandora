import axios from 'axios';
import type { Asset } from './types/asset';
import type { Person } from './types/people';
import type { Accessory } from './types/inventory';
import type { TransactionLog } from './types/activity';
import type { AuthTokens, AuthUser } from './types/auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh/`, { refresh });
        localStorage.setItem('access_token', data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthTokens>('/auth/login/', { email, password }).then(r => r.data),

  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    title?: string;
    location?: string;
    business_group?: string;
    badge_number?: string;
    supervisor_id?: string;
  }) => api.post<AuthTokens>('/auth/register/', data).then(r => r.data),

  google: (id_token: string) =>
    api.post<AuthTokens>('/auth/google/', { id_token }).then(r => r.data),

  refresh: (refresh: string) =>
    api.post<{ access: string }>('/auth/refresh/', { refresh }).then(r => r.data),

  me: () =>
    api.get<AuthUser>('/auth/me/').then(r => r.data),

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// ── Users / People ────────────────────────────────────────────────────────────

export const usersApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    api.get<Person[]>('/users/', { params }).then(r => r.data),

  get: (id: string) =>
    api.get<Person>(`/users/${id}/`).then(r => r.data),

  create: (data: Partial<Person> & { password?: string }) =>
    api.post<Person>('/users/', data).then(r => r.data),

  update: (id: string, data: Partial<Person> & { password?: string }) =>
    api.patch<Person>(`/users/${id}/`, data).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/users/${id}/`),

  retire: (id: string, notes?: string) =>
    api.post<Person>(`/users/${id}/retire/`, { archive_notes: notes }).then(r => r.data),

  restore: (id: string) =>
    api.post<Person>(`/users/${id}/restore/`).then(r => r.data),

  hardDelete: (id: string) =>
    api.delete(`/users/${id}/hard_delete/`),
};

// ── Assets ────────────────────────────────────────────────────────────────────

export const assetsApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    api.get<Asset[]>('/assets/', { params }).then(r => r.data),

  get: (id: string) =>
    api.get<Asset>(`/assets/${id}/`).then(r => r.data),

  create: (data: Partial<Asset>) =>
    api.post<Asset>('/assets/', data).then(r => r.data),

  update: (id: string, data: Partial<Asset>) =>
    api.patch<Asset>(`/assets/${id}/`, data).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/assets/${id}/`),

  retire: (id: string, notes?: string) =>
    api.post<Asset>(`/assets/${id}/retire/`, { archive_notes: notes }).then(r => r.data),

  restore: (id: string) =>
    api.post<Asset>(`/assets/${id}/restore/`).then(r => r.data),

  hardDelete: (id: string) =>
    api.delete(`/assets/${id}/hard_delete/`),

  checkOut: (id: string, userId: string, notes?: string) =>
    api.post<Asset>(`/assets/${id}/check_out/`, { user_id: userId, notes }).then(r => r.data),

  checkIn: (id: string, notes?: string) =>
    api.post<Asset>(`/assets/${id}/check_in/`, { notes }).then(r => r.data),

  changeStatus: (id: string, status: string, notes?: string) =>
    api.post<Asset>(`/assets/${id}/change_status/`, { status, notes }).then(r => r.data),
};

// ── Accessories ───────────────────────────────────────────────────────────────

export const accessoriesApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    api.get<Accessory[]>('/accessories/', { params }).then(r => r.data),

  get: (id: string) =>
    api.get<Accessory>(`/accessories/${id}/`).then(r => r.data),

  create: (data: Partial<Accessory>) =>
    api.post<Accessory>('/accessories/', data).then(r => r.data),

  update: (id: string, data: Partial<Accessory>) =>
    api.patch<Accessory>(`/accessories/${id}/`, data).then(r => r.data),

  remove: (id: string) =>
    api.delete(`/accessories/${id}/`),

  retire: (id: string, notes?: string) =>
    api.post<Accessory>(`/accessories/${id}/retire/`, { archive_notes: notes }).then(r => r.data),

  restore: (id: string) =>
    api.post<Accessory>(`/accessories/${id}/restore/`).then(r => r.data),

  hardDelete: (id: string) =>
    api.delete(`/accessories/${id}/hard_delete/`),

  checkOut: (id: string, quantity: number, userId?: string, notes?: string) =>
    api.post<Accessory>(`/accessories/${id}/check_out/`, { quantity, user_id: userId, notes }).then(r => r.data),

  checkIn: (id: string, quantity: number, notes?: string) =>
    api.post<Accessory>(`/accessories/${id}/check_in/`, { quantity, notes }).then(r => r.data),
};

// ── Transaction logs ──────────────────────────────────────────────────────────

export const transactionsApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    api.get<TransactionLog[]>('/transactions/', { params }).then(r => r.data),

  get: (id: string) =>
    api.get<TransactionLog>(`/transactions/${id}/`).then(r => r.data),
};

export default api;

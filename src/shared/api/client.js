import axios from 'axios';
import { auth } from '../../modules/user/infrastructure/firebase-config.js';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Attach Firebase ID token to every request automatically
apiClient.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401/403 force-refresh the token and retry once
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    if ((status === 401 || status === 403) && !error.config._retried) {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken(true);
          error.config._retried = true;
          error.config.headers.Authorization = `Bearer ${token}`;
          return apiClient(error.config);
        } catch (refreshError) {
          console.error('Failed to refresh Firebase token', refreshError);
        }
      }
    }
    return Promise.reject(error);
  },
);

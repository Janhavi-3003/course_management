import axios from 'axios';
import { clearSession, getToken } from '../utils/auth.js';

export const API_MODE = import.meta.env.VITE_API_MODE || 'real';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 20000,
});

// Send the JWT with every request
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// An expired/invalid token on a logged-in session -> clear it and tell the app
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      clearSession();
      window.dispatchEvent(new Event('cm:session-expired'));
    }
    return Promise.reject(error);
  },
);

export default apiClient;

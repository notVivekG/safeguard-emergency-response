import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.includes('/login') || currentPath.includes('/register');
      const isAuthRoute = error.config?.url?.includes('/auth/');
      if (!isAuthPage && !isAuthRoute) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const pingServer = () =>
  api.get('/').catch(() => {});

export default api;

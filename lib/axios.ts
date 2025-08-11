
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const getAccessTokenFromStorage = (): string | null => {
  try {
    const raw = localStorage.getItem('toeic-auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.accessToken ?? null;
  } catch (err) {
    console.warn('Error reading token from localStorage', err);
    return null;
  }
};

api.interceptors.request.use(
  (config) => {
    const token = getAccessTokenFromStorage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (token) originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        const json = await res.json();
        const newToken = json.data?.accessToken;
        if (!newToken) throw new Error('No access token in refresh response');

        const raw = localStorage.getItem('toeic-auth-storage');
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.state.accessToken = newToken;
          localStorage.setItem('toeic-auth-storage', JSON.stringify(parsed));
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('toeic-auth-storage');
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    const errorData = error.response?.data || {
      success: false,
      message: 'Unknown error',
      code: 0,
      data: null,
      error: 'Unknown Exception',
    };
    if (errorData.code === 9) {
      if (window.location.pathname !== '/login') {
        alert('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
        localStorage.removeItem('toeic-auth-storage');
        window.location.href = '/login';
      }
    }
    console.error('API Error:', errorData);
    return Promise.reject(errorData);
  }
);

export default api;
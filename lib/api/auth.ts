import api from '@/lib/axios';

export const getUserInfo = () => {
  return api.get('/auth/me');
};

export const apiLogin = async (identifier: string, password: string) => {
  const res = await api.post('/auth/login', { identifier, password });
  return res.data;
};

export const logout = () => {
  return api.post('/auth/logout');
};

export const refreshToken = () => {
  return api.post('/auth/refresh');
};
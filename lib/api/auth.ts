import api from '@/lib/axios';
import { RegisterRequest } from '@/types';

export const getUserInfo = async () => await api.get('/auth/me');

export const apiLogin = (identifier: string, password: string) => api.post('/auth/login', { identifier, password });

export const logout = () => api.post('/auth/logout');

export const refreshToken = () => api.post('/auth/refresh');

export const apiRegister = (registerData: RegisterRequest) => api.post('/auth/register', registerData);

export const forgotPassword = (email: string) => api.post('/auth/forgot-password', { email });

export const verifyOtp = (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp });

export const resetPassword = (email: string, newPassword: string, confirmPassword: string, identifyCode: string) =>
    api.post('/auth/reset-password', { email, newPassword, confirmPassword, identifyCode });
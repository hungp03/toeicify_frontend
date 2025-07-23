import api from '@/lib/axios';
import { UpdateUserRequest } from '@/types/user';

export const updateUserInfo = (data: UpdateUserRequest) => api.put('/users/me', data);
export const updateUserPassword = (currentPassword: string, newPassword: string, confirmPassword: string) =>
  api.patch('/users/password', {
    currentPassword,
    newPassword,
    confirmPassword,
  });
export const getUsers = async (page: number, size: number, searchTerm: string) => {
  return api.get(`/admin/users?page=${page}&size=${size}&searchTerm=${searchTerm}`);
};

export const toggleUserStatus = async (userId: number) => {
  return api.put(`/admin/users/${userId}/toggle-status`);
};
import api from '@/lib/axios';
import { UpdateUserRequest } from '@/types/user';

export const updateUserInfo = (data: UpdateUserRequest) => api.put('/users/me', data);
export const updateUserPassword = (currentPassword: string, newPassword: string, confirmPassword: string) =>
  api.patch('/users/password', {
    currentPassword,
    newPassword,
    confirmPassword,
  });
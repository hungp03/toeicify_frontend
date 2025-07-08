import api from '@/lib/axios';
import { UpdateUserRequest } from '@/types/user';

export const updateUserInfo = async (data: UpdateUserRequest) => {
  const res = await api.put('/users/me', data); 
  return res.data.data; 
};
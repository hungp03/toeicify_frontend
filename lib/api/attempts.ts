import api from '@/lib/axios';
import { PaginationResponse, AttemptHistoryRow, AttemptsCountResponse } from '@/types/attempts';

export async function getMyAttemptHistory(page = 1, size = 10) {
  const res = await api.get<PaginationResponse<AttemptHistoryRow>>('/attempts/history', {
    params: { page, size },
  });
  return res.data;
}

export async function getAttemptsCount() {
  const { data } = await api.get<AttemptsCountResponse>('/attempts/attempts-count');
  return data;
}
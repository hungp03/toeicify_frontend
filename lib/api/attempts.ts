import api from '@/lib/axios';
import { PaginationResponse, AttemptHistoryRow } from '@/types/attempts';

export async function getMyAttemptHistory(page = 1, size = 10) {
  const res = await api.get<PaginationResponse<AttemptHistoryRow>>('/attempts/history', {
    params: { page, size },
  });
  return res.data;
}

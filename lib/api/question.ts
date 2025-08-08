import api from '@/lib/axios';

export const getQuestionsByPartIds = async (params?: { partIds: string[] }) => {
  return await api.get('/question-groups/by-parts', {
    params: {
      partIds: params?.partIds?.join(','), // -> partIds=1,2,3
    },
  });
};

export const getQuestionsByExamId = async (examId: number) => {
  return await api.get(`/question-groups/by-exam/${examId}`);
};
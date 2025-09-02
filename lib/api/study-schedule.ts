import api from '@/lib/axios';
import { NewSchedulePayload, NewTodoPayload } from '@/types/study-schedule';

export const createNewSchedule = async (data: NewSchedulePayload) => {
  const response = await api.post('/study-schedule', data);
  return response.data;
};

export const getStudySchedules = async (page: number, size: number, sort: string) => {
  const response = await api.get('/study-schedule', {
    params: { page, size, sort }
  });
  return response.data;
};

export const deleteStudySchedule = async (scheduleId: number) => {
  await api.delete(`/study-schedule/${scheduleId}`);
};

export const createSingleTodo = async (data: NewTodoPayload) => {
  const response = await api.post('/todos', data);
  return response.data;
};

export const updateSingleTodo = async (todoId: number, data: Partial<NewTodoPayload>) => {
  const response = await api.patch(`/todos/${todoId}`, data);
  return response.data;
};

export const setCompletion = async (todoId: number, completed: boolean) => {
  await api.patch(`/todos/${todoId}/completion?completed=${completed}`);
};

export const deleteTodoItem = async (todoId: number) => {
  await api.delete(`/todos/${todoId}`);
};

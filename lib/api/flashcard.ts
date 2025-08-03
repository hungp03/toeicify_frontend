import api from '@/lib/axios';
export const getFlashcardLists = async (type: 'mine' | 'learning' | 'explore', page = 1, size = 10) => {
  const res = await api.get(`/flashcards/list?type=${type}&page=${page - 1}&size=${size}`);
  return res.data;
};
export const createFlashcardList = async (data: { listName: string; description?: string }) => {
  const res = await api.post('/flashcards/list', data);
  return res.data;
};
export const getFlashcardListDetail = async (listId: string) => {
  const res = await api.get(`/flashcards/list/${listId}`);
  return res.data;
};
export const getPaginatedFlashcards = async (listId: string, page = 1, size = 10) => {
  const res = await api.get(`/flashcards/list/${listId}/cards?page=${page - 1}&size=${size}`);
  return res.data;
};
export const createFlashcard = async (listId: string, data: {
  frontText: string;
  backText: string;
  category?: string;
}) => {
  const res = await api.post(`/flashcards/${listId}/cards`, data);
  return res.data;
};
export const updateFlashcard = async (
  listId: number,
  cardId: number,
  data: {
    frontText: string;
    backText: string;
    category?: string;
  }
) => {
  const res = await api.put(`/flashcards/${listId}/cards/${cardId}`, data);
  return res.data;
};
export const deleteFlashcard = async (listId: string, cardId: number) => {
  const res = await api.delete(`/flashcards/${listId}/cards/${cardId}`);
  return res.data;
};
export const toggleFlashcardListPublic = async (listId: string) => {
  const res = await api.put(`/flashcards/${listId}/toggle-public`);
  return res.data;
};
export const updateFlashcardList = async (
  listId: string,
  data: {
    listName: string;
    description?: string;
    flashcards: {
      frontText: string;
      backText: string;
      category?: string;
    }[];
  }
) => {
  const res = await api.put(`/flashcards/list/${listId}`, data);
  return res.data;
};

export const markListInProgress = async (listId: string) => {
  const res = await api.put(`/flashcards/list/${listId}/start-learning`);
  return res.data;
};
export const stopLearningFlashcardList = async (listId: string) => {
  const res = await api.put(`/flashcards/list/${listId}/stop-learning`);
  return res.data;
};
export const deleteFlashcardList = async (listId: string) => {
  const res = await api.delete(`/flashcards/list/${listId}`);
  return res.data;
};
export const searchFlashcardLists = async (keyword: string, page = 1, size = 8) => {
  const res = await api.get(`/flashcards/search`, {
    params: { keyword, page: page - 1, size }
  });
  return res.data;  
};
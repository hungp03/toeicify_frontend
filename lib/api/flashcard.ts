import api from '@/lib/axios';

export const getFlashcardLists = async (type: 'mine' | 'learning' | 'explore') => {
  const res = await api.get(`/flashcards/list?type=${type}`);
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


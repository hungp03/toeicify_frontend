import api from "@/lib/axios";
import { QuestionGroup } from "@/types";
import { QuestionGroupRequest, QuestionGroupResponse, UpdateQuestionGroupRequest } from "@/types/question";


export const getQuestionGroupsByPartId = async (partId: number) => api.get(`/question-groups/by-part/${partId}`);

export const createQuestionGroup = async (data: QuestionGroupRequest) => {
    const res = await api.post<QuestionGroupResponse>("/question-groups", data);
    return res.data;
  };
  
export const updateQuestionGroup = async (groupId: number, data: UpdateQuestionGroupRequest) => {
    const res = await api.put<QuestionGroupResponse>(`/question-groups/${groupId}`, data);
    return res.data;
  };

export const deleteQuestionGroup = async (groupId: number) => {
    await api.delete(`/question-groups/${groupId}`);
  };
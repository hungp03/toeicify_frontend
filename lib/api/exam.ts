import api from "@/lib/axios";

import { ExamRequest, ExamResponse, SubmitExamRequest } from "@/types";


export const getAllExams = async (params?: {
    keyword?: string;
    categoryId?: number;
    page?: number;
    size?: number;
}) => api.get("/exams", { params });

export const getExamCategories = async (
    params?: { page?: number; size?: number }
) => api.get("/exam-categories", { params });

export const getAllExamCategoriesList = async () =>
    api.get("/exam-categories/all");

export const createExamCategory = async (data: {
    categoryName: string;
    description: string;
}) => api.post("/exam-categories", data);

export const updateExamCategory = async (id: number, data: {
    categoryName: string;
    description: string;
}) => api.put(`/exam-categories/${id}`, data);

export const getAllExamsForClient = async (params?: {
    keyword?: string;
    categoryId?: number;
    page?: number;
    size?: number;
}) => api.get("/exams/public", { params });


export const deleteExamCategory = async (id: number) => api.delete(`/exam-categories/${id}`);

export const getExamById = async (examId: number) => api.get(`/exams/${examId}`);
export const getPublicExamById = async (examId: number) => api.get(`/exams/public/${examId}`);

export const createExam = async (data: ExamRequest) => api.post("/exams", data);

export const deleteExam = async (examId: number) => api.delete(`/exams/${examId}`);

export const updateExamStatus = async (examId: number, status: string) =>
    api.patch(`/exams/${examId}/status`, null, {
        params: { status },
    });
export const updateExam = async (id: number, data: ExamRequest) => {
        const res = await api.put<ExamResponse>(`/exams/${id}`, data);
        return res.data;
    };

export const submitExam = async (data: SubmitExamRequest) => api.post("/exams/submit", data);

export const getExamResults = async (attemptId: number) => api.get(`/exams/attempts/${attemptId}/result`);

export const getQuestionExplain = async (questionId: number) => api.get(`/question-groups/explain/${questionId}`);

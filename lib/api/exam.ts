import api from "@/lib/axios";

export const getAllExams = async (params?: {
    keyword?: string;
    categoryId?: number;
    page?: number;
    size?: number;
}) => api.get("/exams", { params });

export const getExamCategories = async (
    params?: { page?: number; size?: number }
) => api.get("/exam-categories", { params });
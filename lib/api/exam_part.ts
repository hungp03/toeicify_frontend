// src/lib/api/exam-part.ts
import api from "@/lib/axios";
import { MissingPartResponse } from "@/types";

export const deleteExamPartById = (partId: number) => {
  return api.delete<void>(`/exam-parts/${partId}`);
};

  
export const getMissingParts = (examId: number) =>
    api.get<MissingPartResponse[]>(`/exam-parts/missing/${examId}`);
export type PracticeTests = {
  examId: number;
  examName: string;
  examDescription: string | null;
  totalQuestions: number;
  createdByName: string;
  categoryName: string;
  totalParts: number;
  status: string | null;
};

export type ExamPart = {
  partId: number;
  partNumber: number;
  partName: string;
  description: string;
  questionCount: number;
}
export type ExamData = {
  examId: number;
  examName: string;
  examDescription: string;
  totalQuestions: number;
  listeningAudioUrl: string;
  status: string;
  createdAt: string | null;
  categoryId: number;
  categoryName: string;
  createdById: number;
  createdByName: string;
  examParts: ExamPart[];
}

export interface ExamPartResponse {
  partId: number;
  partNumber: number;
  partName: string;
  description: string;
  questionCount: number;
}

export interface ExamResponse {
  examId: number;
  examName: string;
  examDescription: string;
  totalQuestions: number;
  listeningAudioUrl: string;
  status: string;
  createdAt: string;
  categoryId: number;
  categoryName: string;
  createdById: number;
  createdByName: string;
  examParts: ExamPartResponse[];
}

export interface ExamPartRequest {
  partNumber: number;
  partName: string;
  description: string;
  questionCount: number;
}

export interface ExamRequest {
  examName: string;
  examDescription: string;
  totalQuestions: number;
  listeningAudioUrl: string;
  categoryId: number;
  examParts: ExamPartRequest[];
}

export interface ExamSearchParams {
  keyword?: string;
  categoryId?: number;
  page?: number;
  size?: number;
}
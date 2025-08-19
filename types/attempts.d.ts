export type AttemptItem = {
  attemptId: number;
  fullTest: boolean;
  parts: number[];
  correct: number;
  total: number;
  toeicScore?: number | null;
  startTime: string;
  endTime: string | null;
  durationSeconds: number;
};

export type AttemptHistoryRow = {
  examId: number;
  examName: string;
  attempt: AttemptItem;
};

export type PaginationMeta = {
  page: number;      
  pageSize: number;
  pages: number;     
  total: number;     
};

export type PaginationResponse<T> = {
  meta: PaginationMeta;
  result: T[];
};

export type ExamHistory = {
  examId: number;
  examName: string;
  attempts: AttemptItem[];
};

export type AttemptsCountResponse = {
  totalAttempts: number;
  fullTests: number;
  practiceAttempts: number;
};
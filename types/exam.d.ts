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

export interface PartConfig {
  name: string;
  questionType: string;
  hasAudio: boolean;
  hasImage: boolean;
  hasPassage: boolean;
  hasQuestionText: boolean;
  optionCount: number;
  questionsPerGroup: number;
  description: string;
}

export interface TestInfoProps {
  testTitle: string;
  setTestTitle: (title: string) => void;
  testDescription: string;
  setTestDescription: (description: string) => void;
  currentPart: number;
  setCurrentPart: (part: number) => void;
  totalQuestions: number;
  questionsByPart: Record<number, number>;
  partConfigs: Record<number, PartConfig>;
  onAddQuestionGroup: () => void;
  onSaveTest: () => void;
  onPreviewTest: () => void;
}


export type QuestionOption = {
  optionLetter: string;
  optionText: string;
};

export type Question = {
  questionText?: string;
  questionType: string;
  correctAnswerOption: string;
  explanation: string;
  options: QuestionOption[];
};

export type QuestionGroup = {
  id?: string;
  partId: number;
  imageUrl?: string;
  audioUrl?: string;
  passageText?: string;
  questions: Question[];
};

export interface PartConfig {
  name: string;
  questionType: string;
  hasAudio: boolean;
  hasImage: boolean;
  hasPassage: boolean;
  hasQuestionText: boolean;
  optionCount: number;
  questionsPerGroup: number;
  description: string;
}

export interface QuestionGroupListProps {
  questionGroups: QuestionGroup[];
  partConfigs: Record<number, PartConfig>;
  onEdit: (group: QuestionGroup) => void;
  onRemove: (id: string) => void;
}

export type QuestionOption = {
  optionLetter: string;
  optionText: string;
};

export type Question = {
  questionText?: string;
  questionType: string;
  correctAnswerOption: string;
  explanation: string;
  options: QuestionOption[];
};

export type QuestionCreator = {
  id: string;
  part: string;
  type: string;
  question: string;
  options: string[];
  correct: string;
  audio?: File | null;
  image?: File | null;
  text?: string;
};

export type QuestionGroup = {
  id?: string;
  partId: number;
  imageUrl?: string;
  audioUrl?: string;
  passageText?: string;
  questions: Question[];
};

export interface PartConfig {
  name: string;
  questionType: string;
  hasAudio: boolean;
  hasImage: boolean;
  hasPassage: boolean;
  hasQuestionText: boolean;
  optionCount: number;
  questionsPerGroup: number;
  description: string;
}

export interface QuestionGroupFormProps {
  questionGroup: QuestionGroup;
  partConfig: PartConfig;
  onSave: (group: QuestionGroup) => void;
  onCancel: () => void;
}

export interface SubmitExamRequest {
  examId: number;
  submitType: 'full' | 'partial';
  partIds?: number[];
  startTime: string;
  endTime: string;
  answers: Array<{
    questionId: number;
    selectedOption: string;
  }>;
}

export interface ExamSubmissionResponse {
  attemptId: number;
  totalScore: number;
  listeningScore: number;
  readingScore: number;
  completionTimeMinutes: number;
  submittedAt: string;
  partsDetail: Array<{
    partNumber: number;
    partName: string;
    correctAnswers: number;
    totalQuestions: number;
    accuracyPercent: number;
  }>;
  examSummary: {
    examId: number;
    submitType: string;
    partsSubmitted: number[];
  };
}
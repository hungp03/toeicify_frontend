export type QuestionType =
  | "LISTENING_PHOTO"
  | "LISTENING_QUESTION_RESPONSE"
  | "LISTENING_CONVERSATION"
  | "LISTENING_TALK"
  | "READING_INCOMPLETE_SENTENCES"
  | "READING_TEXT_COMPLETION"
  | "READING_SINGLE_PASSAGE"
  | "READING_DOUBLE_PASSAGE"
  | "READING_TRIPLE_PASSAGE";


export interface QuestionOptionRequest {
    optionLetter: string; // "A" | "B" | "C" | "D"
    optionText: string;
}

  
export interface QuestionRequest {
  questionId?: number;
  questionNumber?: number;        
  questionText?: string;
  questionType: QuestionType;
  correctAnswerOption: "A" | "B" | "C" | "D";
  explanation?: string;
  options: QuestionOptionRequest[];
}

export interface QuestionGroupRequest {
  partId: number;
  passageText?: string;
  imageUrl?: string;
  audioUrl?: string;
  questions: QuestionRequest[];
}
  
export interface QuestionOptionResponse {
  optionId: number;
  optionLetter: string;
  optionText: string;
}

export interface QuestionResponse {
  questionId: number;
  questionText?: string;
  questionType: QuestionType;
  questionNumber?: number
  correctAnswerOption: string;
  explanation?: string;
  options: QuestionOptionResponse[];
}

export interface QuestionGroupResponse {
  groupId: number;
  partId: number;
  partName: string;
  passageText?: string;
  imageUrl?: string;
  audioUrl?: string;
  questions: QuestionResponse[];
}
export type PartRule = {
    displayName: string;
    questionsPerGroup: number;
    optionLetters: ("A" | "B" | "C" | "D")[];
    showImage: boolean; // show group-level imageUrl field
    showAudio: boolean; // show group-level audioUrl field
    showPassage: boolean; // show group-level passageText field
    defaultQuestionType: QuestionType;
    // Whether the questionText is required for each question in this part
    requireQuestionText: boolean;
};

export type PartRuleUpdate = {
    displayName: string;
    defaultQuestionsPerGroup: number;
    optionLetters: ("A" | "B" | "C" | "D")[];
    showImage: boolean;
    showAudio: boolean;
    showPassage: boolean;
    defaultQuestionType: QuestionType;
    requireQuestionText: boolean;
  };


  export interface AddQuestionGroupDialogProps {
    open: boolean;
    onOpenChange: (next: boolean) => void;
    partId: number | null;
    partNumber: number | null;
    onCreated?: () => void;
    existingNumbers?: number[]; 
  }


export type UpdateQuestionOptionRequest = {
    optionId?: number;
    optionLetter: "A" | "B" | "C" | "D";
    optionText: string;
  };
  
export type UpdateQuestionRequest = {
    questionId?: number;
    questionText?: string;
    questionType: QuestionType;
    correctAnswerOption: string;
    explanation?: string;
    options: UpdateQuestionOptionRequest[];
  };
  
export type UpdateQuestionGroupRequest = {
    partId: number;
    passageText?: string;
    imageUrl?: string;
    audioUrl?: string;
    questions: UpdateQuestionRequest[];
  };

export interface EditQuestionGroupDialogProps {
    open: boolean;
    onOpenChange: (next: boolean) => void;
    /** group đang edit */
    group: QuestionGroupResponse | null;
    /** thông tin part hiện hành */
    partNumber: number | null;
    partId: number | null;
    onUpdated?: () => void;
  }
export type ConfirmDeleteGroupDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  group: QuestionGroupResponse | null;
  onDeleted?: () => void;
};

export type UIOption = { optionId?: number; letter: "A"|"B"|"C"|"D"; text: string };

export type UIQuestion = {
    questionId?: number;
    questionNumber?: number; // Số thứ tự câu hỏi trong nhóm
    questionText: string;
    correctAnswerOption: string;
    explanation: string;
    options: Record<"A"|"B"|"C"|"D", UIOption | undefined>; 
  };


export interface Option {
  optionId: number;
  optionText: string;
  optionLetter: string;
}

export interface Question {
  questionNumber: number;
  questionId: number;
  questionText: string;
  questionType: string;
  options: Option[];
}

export interface Group {
  groupId: number;
  audioUrl: string;
  imageUrl: string;
  questions: Question[];
  passageText: string;
}
export interface PartData {
  partId: number;
  partName: string;
  partNumber: number;
  description: string | null;
  groups: Group[];
}

export {PartData, Group, Question, Option};


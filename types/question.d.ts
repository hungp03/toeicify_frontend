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

interface Option {
  optionId: number;
  optionText: string;
  optionLetter: string;
}

interface Question {
  questionId: number;
  questionText: string;
  questionType: string;
  options: Option[];
}

interface Group {
  groupId: number;
  audioUrl: string;
  imageUrl: string;
  questions: Question[];
  passageText: string;
}
interface PartData {
  partId: number;
  partName: string;
  partNumber: number;
  description: string | null;
  groups: Group[];
}

export {PartData, Group, Question, Option};
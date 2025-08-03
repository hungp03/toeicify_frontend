export interface FlashcardDetail {
    cardId: number;
    frontText: string;
    backText: string;
    category?: string;
}
  
export interface ListDetailResponse {
    listName: string;
    description: string;
    flashcards: FlashcardDetail[];
    isPublic: boolean;
    isOwner: boolean;
    inProgress: boolean;
}
export type FlashcardList = {
  listId: number;
  listName: string;
  description?: string;
  cardCount: number;
  createdAt: string;
  isPublic: boolean;
  ownerName?: string;
};

  
export interface TestDialogProps {
    open: boolean;
    max: number;
    defaultCount: number;
    onConfirm: (count: number) => void;
    onClose: () => void;
}


export type QuestionType = 'multiple' | 'fill';
export type AnswerStatus = 'correct' | 'wrong' | 'dontknow';

export interface LearnCard {
  index: number;
  type: QuestionType;
  status?: AnswerStatus;
  seen?: number;
  cluster: number;
}
export type QuestionTypeTest = 'truefalse' | 'multiple' | 'written';

export interface TestQuestion {
  type: QuestionTypeTest;
  frontText: string;
  backText: string;
  options?: string[];
  image?: string;
}
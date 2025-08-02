import dynamic from 'next/dynamic';
import { FlashcardLearnLoading } from '@/components/flashcards/flashcard-learn';

const FlashcardLearnContent = dynamic(
  () => import('@/components/flashcards/flashcard-learn').then(mod => ({ 
    default: mod.FlashcardLearnContent 
  })),
  { 
    loading: () => <FlashcardLearnLoading />
  }
);

export default function Page() {
  return <FlashcardLearnContent />;
}
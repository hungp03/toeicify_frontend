import dynamic from 'next/dynamic';
import { FlashcardStudyLoading } from '@/components/flashcards/flashcard-study';

const FlashcardStudyContent = dynamic(
  () => import('@/components/flashcards/flashcard-study').then(mod => ({ 
    default: mod.FlashcardStudyContent 
  })),
  { 
    loading: () => <FlashcardStudyLoading />
  }
);

export default function Page() {
  return <FlashcardStudyContent />;
}
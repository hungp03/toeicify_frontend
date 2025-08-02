import dynamic from 'next/dynamic';
import { FlashcardEditLoading } from '@/components/flashcards/flashcard-edit';

const FlashcardEditContent = dynamic(
  () => import('@/components/flashcards/flashcard-edit').then(mod => ({ 
    default: mod.FlashcardEditContent 
  })),
  { 
    loading: () => <FlashcardEditLoading />
  }
);

export default function Page() {
  return <FlashcardEditContent />;
}
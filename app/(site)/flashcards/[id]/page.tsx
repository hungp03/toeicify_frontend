import dynamic from 'next/dynamic';
import { FlashcardListDetailLoading } from '@/components/flashcards/flashcard-list-detail';

// Dynamic import
const FlashcardListDetailContent = dynamic(
  () => import('@/components/flashcards/flashcard-list-detail').then(mod => ({ default: mod.FlashcardListDetailContent })),
  { 
    loading: () => <FlashcardListDetailLoading />
  }
);

export default function Page() {
  return <FlashcardListDetailContent />;
}
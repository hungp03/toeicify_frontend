
import { Suspense } from 'react';
import { FlashcardTestContent, FlashcardTestLoading } from '@/components/flashcards/flashcard-test';

export default function Page() {
  return (
    <Suspense fallback={<FlashcardTestLoading />}>
      <FlashcardTestContent />
    </Suspense>
  );
}
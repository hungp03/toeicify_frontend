import dynamic from 'next/dynamic';
import FullPageLoader from '@/components/common/full-page-loader';

const FlashcardTestWithProtection = dynamic(
  () => import('@/components/flashcards/flashcard-test-wrapper'),
  { 
    loading: () => <FullPageLoader />
  }
);

export default function Page() {
  return <FlashcardTestWithProtection />;
}
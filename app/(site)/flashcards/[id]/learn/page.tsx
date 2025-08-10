import dynamic from 'next/dynamic';
import FullPageLoader from '@/components/common/full-page-loader';

const FlashcardLearnWithProtection = dynamic(
  () => import('@/components/flashcards/flashcard-learn-wrapper'),
  { 
    loading: () => <FullPageLoader />
  }
);

export default function Page() {
  return <FlashcardLearnWithProtection />;
}
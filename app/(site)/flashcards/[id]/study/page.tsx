import dynamic from 'next/dynamic';
import FullPageLoader from '@/components/common/full-page-loader';

const FlashcardStudyWithProtection = dynamic(
  () => import('@/components/flashcards/flashcard-study-wrapper'),
  { 
    loading: () => <FullPageLoader />
  }
);

export default function Page() {
  return <FlashcardStudyWithProtection />;
}
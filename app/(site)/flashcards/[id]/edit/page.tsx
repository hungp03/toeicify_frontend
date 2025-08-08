import dynamic from 'next/dynamic';
import FullPageLoader from '@/components/common/full-page-loader';

const FlashcardEditWithProtection = dynamic(
  () => import('@/components/flashcards/flashcard-edit-wrapper'),
  { 
    loading: () => <FullPageLoader />
  }
);

export default function Page() {
  return <FlashcardEditWithProtection />;
}
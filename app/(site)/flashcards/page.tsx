import dynamic from 'next/dynamic';
import { FlashcardsListLoading } from '@/components/flashcards/flashcards-list'

const FlashcardsListContent = dynamic(
  () => import('@/components/flashcards/flashcards-list').then(mod => ({
    default: mod.FlashcardsListContent
  })),
  {
    loading: () => <FlashcardsListLoading />
  }
);

export default function Page() {
  return <FlashcardsListContent />;
}
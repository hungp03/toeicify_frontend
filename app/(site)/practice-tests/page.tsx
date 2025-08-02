import { Suspense } from 'react';
import PracticeTestsList, { PracticeTestsLoading } from '@/components/practice-tests/practice-test-list';

export default function PracticeTestsPage() {
  return (
    <Suspense fallback={<PracticeTestsLoading />}>
      <PracticeTestsList />
    </Suspense>
  );
}
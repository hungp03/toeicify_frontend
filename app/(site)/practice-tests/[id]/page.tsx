import { Suspense } from 'react';
import TestSetup from '@/components/practice-tests/practice-test-info';
import FullPageLoader from '@/components/common/full-page-loader';
export default function PracticeTestsPage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <TestSetup />
    </Suspense>
  );
}
import dynamic from 'next/dynamic';
import FullPageLoader from '@/components/common/full-page-loader';

const TestResultsPageWithProtection = dynamic(
  () => import('@/components/practice-tests/practice-result-detail-wrapper'),
  { 
    loading: () => <FullPageLoader />
  }
);

export default function Page() {
  return <TestResultsPageWithProtection />;
}
import dynamic from 'next/dynamic';
import FullPageLoader from '@/components/common/full-page-loader';

const TestPageWithProtection = dynamic(
  () => import('@/components/practice-tests/practice-test-page-wrapper'),
  { 
    loading: () => <FullPageLoader />
  }
);

export default function Page() {
  return <TestPageWithProtection />;
}
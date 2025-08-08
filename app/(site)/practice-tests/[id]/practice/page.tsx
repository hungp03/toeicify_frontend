import dynamic from 'next/dynamic';
import FullPageLoader from '@/components/common/full-page-loader';

const TestPage = dynamic(
  () => import('@/components/practice-tests/practice-test-page'),
  { loading: () => <FullPageLoader /> }
);


export default function Page() {
  return <TestPage />;
}
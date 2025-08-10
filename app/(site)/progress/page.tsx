import dynamic from 'next/dynamic';
import FullPageLoader from '@/components/common/full-page-loader';

const ProgressPage = dynamic(
  () => import('@/components/progress/progress'),
  { 
    loading: () => <FullPageLoader />
  }
);

export default function Page() {
  return <ProgressPage />;
}
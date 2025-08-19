import dynamic from 'next/dynamic';
import FullPageLoader from '@/components/common/full-page-loader';

const FeedbackPage = dynamic(
  () => import('@/components/feedback/feedback-content'),
  { 
    loading: () => <FullPageLoader />
  }
);

export default function Page() {
  return <FeedbackPage />;
}
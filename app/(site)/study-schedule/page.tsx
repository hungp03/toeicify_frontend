import dynamic from 'next/dynamic';
import FullPageLoader from '@/components/common/full-page-loader';

const StudySchedulePage = dynamic(
  () => import('@/components/study-schedule/study-schedule-page'),
  { 
    loading: () => <FullPageLoader />
  }
);

export default function Page() {
  return <StudySchedulePage />;
}
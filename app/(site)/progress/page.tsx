import dynamic from 'next/dynamic';
import FullPageLoader from '@/components/common/full-page-loader';

const LoginWithProtection = dynamic(
  () => import('@/components/progress/progress'),
  { 
    loading: () => <FullPageLoader />
  }
);

export default function Page() {
  return <LoginWithProtection />;
}
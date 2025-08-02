import dynamic from 'next/dynamic';
import FullPageLoader from '@/components/common/full-page-loader';

// Dynamic import component with HOC
const LoginWithProtection = dynamic(
  () => import('@/components/authentication/login-wrapper'),
  { 
    loading: () => <FullPageLoader />
  }
);

export default function Page() {
  return <LoginWithProtection />;
}
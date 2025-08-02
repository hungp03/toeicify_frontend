import dynamic from 'next/dynamic';
import FullPageLoader from '@/components/common/full-page-loader';

const ForgotPasswordWithProtection = dynamic(
  () => import('@/components/authentication/forgot-password-wrapper'),
  { 
    loading: () => <FullPageLoader />
  }
);

export default function Page() {
  return <ForgotPasswordWithProtection />;
}
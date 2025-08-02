import dynamic from 'next/dynamic';
import FullPageLoader from '@/components/common/full-page-loader';

const RegisterWithProtection = dynamic(
  () => import('@/components/authentication/register-wrapper'),
  { 
    loading: () => <FullPageLoader />
  }
);

export default function Page() {
  return <RegisterWithProtection />;
}
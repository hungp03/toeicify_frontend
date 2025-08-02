import AuthFailedWithProtection from '@/components/authentication/auth-failed-wrapper';

// Force dynamic rendering - tắt static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  return <AuthFailedWithProtection />;
}
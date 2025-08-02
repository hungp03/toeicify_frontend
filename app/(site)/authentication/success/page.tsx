import AuthSuccessWithProtection from '@/components/authentication/auth-success-wrapper';

// Force dynamic rendering - turn off static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  return <AuthSuccessWithProtection />;
}
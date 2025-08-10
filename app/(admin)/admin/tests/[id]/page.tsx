import dynamic from 'next/dynamic';
import { AdminTestsDetailLoading } from '@/components/admin/admin-test-detail';

const AdminTestDetailContent = dynamic(
  () => import('@/components/admin/admin-test-detail').then(mod => ({ 
    default: mod.AdminTestsDetailContent 
  })),
  { 
    loading: () => <AdminTestsDetailLoading />
  }
);

export default function Page() {
  return <AdminTestDetailContent />;
}
import dynamic from 'next/dynamic';
import { AdminTestsLoading } from '@/components/admin/admin-tests';

const AdminTestsContent = dynamic(
  () => import('@/components/admin/admin-tests').then(mod => ({ 
    default: mod.AdminTestsContent 
  })),
  { 
    loading: () => <AdminTestsLoading />
  }
);

export default function Page() {
  return <AdminTestsContent />;
}
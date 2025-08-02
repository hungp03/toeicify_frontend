import dynamic from 'next/dynamic';
import { AdminUsersLoading } from '@/components/admin/admin-users';

const AdminUsersContent = dynamic(
  () => import('@/components/admin/admin-users').then(mod => ({ 
    default: mod.AdminUsersContent 
  })),
  { 
    loading: () => <AdminUsersLoading />
  }
);

export default function Page() {
  return <AdminUsersContent />;
}
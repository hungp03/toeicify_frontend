import dynamic from 'next/dynamic';
import { AdminCategoriesLoading } from '@/components/admin/admin-categories';

const AdminCategoriesContent = dynamic(
  () => import('@/components/admin/admin-categories').then(mod => ({ 
    default: mod.AdminCategoriesContent 
  })),
  { 
    loading: () => <AdminCategoriesLoading />
  }
);

export default function Page() {
  return <AdminCategoriesContent />;
}
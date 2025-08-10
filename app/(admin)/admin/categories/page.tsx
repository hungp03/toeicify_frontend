'use client';

import dynamic from 'next/dynamic';
import { withRole } from '@/hoc/with_role';
import { AdminCategoriesLoading } from '@/components/admin/admin-categories';

// 1) Dynamic import phần content để chạy client-side + có skeleton
const AdminCategoriesContent = dynamic(
  () =>
    import('@/components/admin/admin-categories').then((mod) => mod.AdminCategoriesContent),
  {
    loading: () => <AdminCategoriesLoading />,
    ssr: false,
  }
);

// 2) Bọc HOC role (ví dụ chỉ cho ADMIN)
const AdminCategoriesGuarded = withRole(['ADMIN'])(AdminCategoriesContent);

// 3) Export mặc định
export default function Page() {
  return <AdminCategoriesGuarded />;
}

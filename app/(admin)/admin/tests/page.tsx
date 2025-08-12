'use client';

import dynamic from 'next/dynamic';
import { withRole } from '@/hoc/with_role';
import { AdminTestsLoading } from '@/components/admin/admin-tests';

// 1) Dynamic import phần content (client-side + skeleton)
const AdminTestsContent = dynamic(
  () =>
    import('@/components/admin/admin-tests').then((mod) => mod.AdminTestsContent),
  {
    loading: () => <AdminTestsLoading />,
    ssr: false,
  }
);

// 2) Bọc HOC role (ví dụ chỉ cho ADMIN vào trang này)
const AdminTestsGuarded = withRole(['ADMIN'])(AdminTestsContent);

// 3) Export page
export default function Page() {
  return <AdminTestsGuarded />;
}

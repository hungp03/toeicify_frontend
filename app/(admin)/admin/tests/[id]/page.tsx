'use client';

import dynamic from 'next/dynamic';
import { withRole } from '@/hoc/with_role';
import { AdminTestsDetailLoading } from '@/components/admin/admin-test-detail';

// 1) Dynamic import phần content
const AdminTestDetailContent = dynamic(
  () =>
    import('@/components/admin/admin-test-detail').then((mod) => mod.AdminTestsDetailContent),
  {
    loading: () => <AdminTestsDetailLoading />,
    ssr: false,
  }
);

// 2) Bọc HOC role (ví dụ chỉ ADMIN mới truy cập)
const AdminTestDetailGuarded = withRole(['ADMIN'])(AdminTestDetailContent);

// 3) Export page
export default function Page() {
  return <AdminTestDetailGuarded />;
}

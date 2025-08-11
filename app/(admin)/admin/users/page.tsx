'use client';

import dynamic from 'next/dynamic';
import { withRole } from '@/hoc/with_role';
import { AdminUsersLoading } from '@/components/admin/admin-users';

// 1) Dynamic import component nội dung
const AdminUsersContent = dynamic(
  () =>
    import('@/components/admin/admin-users').then((mod) => ({
      default: mod.AdminUsersContent,
    })),
  {
    loading: () => <AdminUsersLoading />,
    ssr: false,
  }
);

// 2) Bọc HOC role (ví dụ: chỉ ADMIN được vào)
// Có thể mở rộng: withRole(['ADMIN', 'EDITOR'])
const AdminUsersGuarded = withRole(['ADMIN'])(AdminUsersContent);

// 3) Export page
export default function Page() {
  return <AdminUsersGuarded />;
}

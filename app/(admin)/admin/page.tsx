'use client';

import dynamic from 'next/dynamic';
import { withRole } from '@/hoc/with_role';
import FullPageLoader from '@/components/common/full-page-loader';

const AdminDashboardContent = dynamic(
  () => import('@/components/admin/admin-dashboard'),
  {
    loading: () => <FullPageLoader />,
    ssr: false,
  }
);

const AdminDashboardGuarded = withRole(['ADMIN'])(AdminDashboardContent);

export default function Page() {
  return <AdminDashboardGuarded />;
}

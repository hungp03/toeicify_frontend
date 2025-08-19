'use client';

import dynamic from 'next/dynamic';
import { withRole } from '@/hoc/with_role';
import FullPageLoader from '@/components/common/full-page-loader';

const AdminFeedbackContent = dynamic(
  () => import('@/components/admin/admin-feedback'),
  {
    loading: () => <FullPageLoader />,
    ssr: false,
  }
);

const AdminFeedbackGuarded = withRole(['ADMIN'])(AdminFeedbackContent);

export default function Page() {
  return <AdminFeedbackGuarded />;
}

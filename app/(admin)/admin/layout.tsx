import { ReactNode } from 'react';
import AdminSidebar from '@/components/admin/admin-sidebar';
export const metadata = {
  title: 'Admin | Toeicify'
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
     <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-6">{children}</main>
    </div>
  );
}

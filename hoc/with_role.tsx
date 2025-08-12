'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import FullPageLoader from '@/components/common/full-page-loader';
import { toast } from 'sonner';

export function withRole<P extends Record<string, any> = {}>(allowedRoles: string[]) {
  return function wrap(Wrapped: React.ComponentType<P>) {
    function RoleGuard(props: P) {
      const router = useRouter();
      const user = useAuthStore(s => s.user);
      const hasHydrated = useAuthStore(s => s.hasHydrated);
      const fetchUser = useAuthStore(s => s.fetchUser);
      const isFetchingUser = useAuthStore(s => (s as any).isFetchingUser ?? false);

      const [redirect, setRedirect] = useState<string | null>(null);
      const toastedRef = useRef(false);

      useEffect(() => {
        if (hasHydrated && !user) fetchUser().catch(() => {});
      }, [hasHydrated]); // eslint-disable-line

      useEffect(() => {
        if (!hasHydrated) return;

        if (!user) {
          if (!isFetchingUser) setRedirect('/login'); // chờ fetch xong hẵng quyết
          return;
        }

        const candidates = [
          (user as any).roleId,
          (user as any).role,
          (user as any).roleName,
        ]
          .filter(Boolean)
          .map((s: any) => String(s).trim().toUpperCase());

        const allowed = new Set(allowedRoles.map(r => r.toUpperCase()));

        const ok = candidates.some(c => allowed.has(c) || (c === 'ADMINISTRATOR' && allowed.has('ADMIN')));
        if (!ok) {
          if (!toastedRef.current) {
            toastedRef.current = true;
            toast.error('Bạn không có quyền truy cập trang này.');
          }
          setRedirect('/'); // hoặc '/403'
        }
      }, [hasHydrated, user, isFetchingUser, allowedRoles]);

      useEffect(() => {
        if (redirect) router.replace(redirect);
      }, [redirect, router]);

      if (!hasHydrated || !user || redirect) return <FullPageLoader />;

      return <Wrapped {...props} />;
    }

    return dynamic(() => Promise.resolve(RoleGuard), { ssr: false });
  };
}

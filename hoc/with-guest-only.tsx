'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import FullPageLoader from '@/components/common/full-page-loader';

export default function withGuestOnly<P extends Record<string, any> = {}>(
  WrappedComponent: React.ComponentType<P>
) {
    return function GuestOnlyWrapper(props: P) {
        const router = useRouter();
        const user = useAuthStore((state) => state.user);
        const hasHydrated = useAuthStore((state) => state.hasHydrated);

        useEffect(() => {
            if (hasHydrated && user) {
                router.replace('/');
            }
        }, [hasHydrated, user]);

        if (!hasHydrated) return <FullPageLoader />;
        if (user) return null;

        return <WrappedComponent {...props} />;
    };
}

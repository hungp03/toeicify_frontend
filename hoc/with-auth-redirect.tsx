'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FullPageLoader from '@/components/common/full-page-loader';

export function withAuthRedirectProtection<P extends Record<string, any>>(WrappedComponent: React.ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
      const token = searchParams.get('token');
      const storedState = sessionStorage.getItem('auth_state');

      if (!token || storedState !== 'true') {
        router.replace('/login');
        return;
      }

      sessionStorage.removeItem('auth_state');
      setAuthorized(true);
      setLoading(false);
    }, []);

    if (loading) {
      return <FullPageLoader />;
    }

    if (!authorized) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

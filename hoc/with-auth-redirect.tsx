'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FullPageLoader from '@/components/common/full-page-loader';
import { useAuthStore } from '@/store/auth';

export function withAuthRedirectProtection<P extends Record<string, any> = {}>(
  WrappedComponent: React.ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const isLoggedIn = useAuthStore((state) => state.user);

    useEffect(() => {
      const token: string | null = searchParams.get('token');
      const isRegister = searchParams.get('isRegister');
      const isLogin = searchParams.get('isLogin');
      const storedState: string | null = sessionStorage.getItem('auth_state');

      if (isLoggedIn) {
        router.replace('/');
        return;
      }

      // Nếu là trường hợp error (isLogin=false hoặc isRegister=false)
      if (isLogin === 'false' || isRegister === 'false') {
        setLoading(false);
        return;
      }

      // Nếu là trường hợp đăng ký thành công (isRegister=true)
      if (isRegister === 'true') {
        // Đăng ký thành công không cần token và storedState
        setLoading(false);
        return;
      }

      // Các trường hợp khác (OAuth login) cần token và storedState
      if (!token || storedState !== 'true') {
        router.replace('/login');
        return;
      }

      sessionStorage.removeItem('auth_state');
      setLoading(false);
    }, [searchParams, router, isLoggedIn]);

    if (loading) {
      return <FullPageLoader />;
    }

    return <WrappedComponent {...props} />;
  };
}
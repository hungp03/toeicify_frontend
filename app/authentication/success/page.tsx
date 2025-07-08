'use client';

import FullPageLoader from '@/components/common/full-page-loader';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import {toast} from 'sonner';
import { useAuthStore } from '@/store/auth';
import { withAuthRedirectProtection } from '@/hoc/with-auth-redirect';

const AuthSuccess = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const oauthLogin = useAuthStore((state) => state.oauthLogin);

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            oauthLogin(token).then(() => {
                toast.success('Đăng nhập thành công!');
                router.replace('/');
            });
        }
    }, [searchParams]);

    return (
        <FullPageLoader />
    );
}

export default withAuthRedirectProtection(AuthSuccess);

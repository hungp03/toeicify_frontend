'use client';

import FullPageLoader from '@/components/common/full-page-loader';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';

export function AuthSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const oauthLogin = useAuthStore((state) => state.oauthLogin);
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const token = searchParams.get('token');
        const isRegister = searchParams.get('isRegister');
        
        if (token) {
            if (isRegister === 'true') {
                toast.success('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
                setTimeout(() => {
                    router.replace('/login');
                }, 1500);
            } else {
                oauthLogin(token).then(() => {
                    toast.success('Đăng nhập thành công!');
                    router.replace('/');
                }).catch(() => {
                    toast.error('Có lỗi xảy ra khi đăng nhập.');
                    router.replace('/login');
                });
            }
        } else if (isRegister === 'true') {
            toast.success('Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
            setTimeout(() => {
                router.replace('/login');
            }, 1500);
        } else {
            toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
            router.replace('/login');
        }
    }, []); 

    return <FullPageLoader />;
}

export function AuthSuccessFallback() {
    return <FullPageLoader />;
}

export function AuthSuccessWrapper() {
    return <AuthSuccessContent />;
}
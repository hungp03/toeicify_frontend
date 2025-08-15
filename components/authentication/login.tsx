'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/schema';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import FullPageLoader from '@/components/common/full-page-loader';
import { BookOpen, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export function LoginContent() {
    const router = useRouter();
    const login = useAuthStore((s) => s.login);

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true);
        try {
            const res = await login(data.identifier, data.password);
            if (res.success) {
                toast.success('Đăng nhập thành công!', {
                    description: 'Đang chuyển về trang chủ...',
                });
                router.push('/');
            } else {
                if (res.code === 9) {
                    toast.error('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
                }
                else {
                    toast.error('Đăng nhập thất bại. Vui lòng kiểm tra thông tin.');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading && <FullPageLoader />}
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <Link
                            href="/"
                            className="flex items-center justify-center gap-2 mb-6"
                        >
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            <span className="text-2xl font-bold text-gray-900">
                                Toeicify
                            </span>
                        </Link>
                        <h2 className="text-3xl font-bold">Chào mừng bạn quay lại</h2>
                        <p className="text-gray-600">
                            Đăng nhập để tiếp tục luyện thi TOEIC
                        </p>
                    </div>

                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl text-center">Đăng nhập</CardTitle>
                            <CardDescription className="text-center">
                                Nhập thông tin để tiếp tục
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div>
                                    <Label htmlFor="identifier">Email hoặc Tên đăng nhập</Label>
                                    <div className="relative mt-1">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="identifier"
                                            {...register('identifier')}
                                            placeholder="Nhập email hoặc username"
                                            className="pl-10"
                                        />
                                    </div>
                                    {errors.identifier && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.identifier.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="password">Mật khẩu</Label>
                                    <div className="relative mt-1">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            {...register('password')}
                                            placeholder="Nhập mật khẩu"
                                            className="pl-10 pr-10"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400" />
                                            )}
                                        </Button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>

                                <div className="text-right">
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white hover:bg-blue-500"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
                                </Button>
                            </form>

                            <div className="mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="bg-white px-2 text-gray-500">
                                            Hoặc đăng nhập bằng
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            sessionStorage.setItem('auth_state', 'true');
                                            window.location.href =
                                                `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth2/authorization/google`
                                        }}
                                    >
                                        <img src="/google.svg" alt="Google" className="h-6 w-6" />
                                        <span className="ml-2">Google</span>
                                    </Button>
                                </div>
                            </div>

                            <p className="mt-6 text-center text-sm text-gray-600">
                                Chưa có tài khoản?{' '}
                                <Link
                                    href="/register"
                                    className="font-medium text-blue-600 hover:underline"
                                >
                                    Đăng ký miễn phí
                                </Link>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

export function LoginWrapper() {
    return <LoginContent />;
}
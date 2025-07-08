"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FullPageLoader from "@/components/common/full-page-loader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from 'next/navigation'
import { useAuthStore } from "@/store/auth";
import withGuestOnly from "@/hoc/with-guest-only";

const Login = () => {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        identifier: "",
        password: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        console.log("Đăng nhập:", formData);
        try {
            const success = await login(formData.identifier, formData.password);
            if (success) {
                toast.success('Đăng nhập thành công!', {
                    description: 'Đang chuyển về trang chủ...',
                    duration: 1000,
                });
                setTimeout(() => {
                    router.push('/');
                }, 1500);
            }
            else {
                toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập của bạn.');
                setTimeout(() => {
                    router.push('/login');
                }, 1500);
            }
        }
        catch (error) {
            console.error("Lỗi đăng nhập:", error);
        }
        finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    return (
        <>
            {loading && <FullPageLoader />}
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            <span className="text-2xl font-bold text-gray-900">Toeicify</span>
                        </Link>
                        <h2 className="text-3xl font-bold text-gray-900">Chào mừng bạn quay lại</h2>
                        <p className="mt-2 text-gray-600">Đăng nhập để tiếp tục luyện thi TOEIC</p>
                    </div>
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
                            <CardDescription className="text-center text-sm text-gray-500">
                                Nhập thông tin tài khoản của bạn để đăng nhập
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="identifier">Email hoặc Tên đăng nhập</Label>
                                        <div className="relative mt-2">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="identifier"
                                                name="identifier"
                                                type="text"
                                                autoComplete="username"
                                                required
                                                className="pl-10"
                                                placeholder="Nhập email hoặc tên đăng nhập"
                                                value={formData.identifier}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                    </div>

                                    <div>
                                        <Label htmlFor="password">Mật khẩu</Label>
                                        <div className="relative mt-2">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="current-password"
                                                required
                                                className="pl-10 pr-10"
                                                placeholder="Nhập mật khẩu"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-gray-400" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center">

                                    <Link
                                        href="/forgot-password"
                                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>

                                <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-500">
                                    Đăng nhập
                                </Button>
                            </form>

                            <div className="mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">Hoặc đăng nhập bằng</span>
                                    </div>
                                </div>

                                <div className="mt-6 gap-3">
                                    <Button variant="outline" className="w-full"
                                        onClick={() => {
                                            window.location.href = "http://localhost:8888/oauth2/authorization/google";
                                        }}
                                    >
                                        <img src="google.svg" alt="Google" className="h-6 w-6" />
                                        Google
                                    </Button>
                                </div>
                            </div>

                            <p className="mt-6 text-center text-sm text-gray-600">
                                Chưa có tài khoản?{" "}
                                <Link
                                    href="/register"
                                    className="font-medium text-blue-600 hover:text-blue-500"
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
};

export default withGuestOnly(Login);

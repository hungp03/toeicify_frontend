'use client';

import { useEffect } from 'react';
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
import { User } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, changePasswordSchema, ProfileFormData, ChangePasswordFormData } from '@/lib/schema';
import dayjs from 'dayjs';
import api from '@/lib/axios';
import { toast } from 'sonner';

const ProfileCard = () => {
    const user = useAuthStore((s) => s.user);
    const updateUser = useAuthStore((s) => s.updateUser);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors: profileErrors, isSubmitting },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: user?.fullName || '',
            username: user?.username || '',
            email: user?.email || '',
            targetScore: user?.targetScore?.toString() || '',
            examDate: user?.examDate
                ? dayjs(user.examDate).format('YYYY-MM-DD')
                : undefined,
        },
    });


    const {
        register: pwRegister,
        handleSubmit: handlePasswordSubmit,
        formState: { errors: passwordErrors, isSubmitting: pwSubmitting },
        reset: resetPasswordForm,
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
    });

    useEffect(() => {
        if (user) {
            setValue('fullName', user.fullName || '');
            setValue('username', user.username || '');
            setValue('email', user.email || '');
            setValue('targetScore', String(user.targetScore ?? 600));
            setValue('examDate', user.examDate ? dayjs(user.examDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'));
        }
    }, [user, setValue]);

    const onSubmitProfile = async (data: ProfileFormData) => {
        const payload = {
            ...data,
            examDate: data.examDate
                ? new Date(data.examDate).toISOString()
                : null,
        };

        try {
            await updateUser(payload);
            toast.success('Cập nhật hồ sơ thành công');
        } catch {
            toast.error('Cập nhật thất bại');
        }
    };

    const onSubmitPassword = async (data: ChangePasswordFormData) => {
        try {
            await api.put('/auth/change-password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            toast.success('Đổi mật khẩu thành công');
            resetPasswordForm();
        } catch (err) {
            toast.error('Đổi mật khẩu thất bại');
            console.error(err);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Hồ sơ cá nhân
                    </CardTitle>
                    <CardDescription>Thông tin và mục tiêu luyện thi TOEIC</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
                        <div>
                            <Label className='mb-2' htmlFor="fullName">Tên</Label>
                            <Input id="fullName" {...register('fullName')} />
                            {profileErrors.fullName && <p className="text-red-500 text-sm">{profileErrors.fullName.message}</p>}
                        </div>

                        <div>
                            <Label className='mb-2' htmlFor="username">Tên đăng nhập</Label>
                            <Input id="username" {...register('username')} />
                            {profileErrors.username && <p className="text-red-500 text-sm">{profileErrors.username.message}</p>}
                        </div>

                        <div>
                            <Label className='mb-2' htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...register('email')} />
                            {profileErrors.email && <p className="text-red-500 text-sm">{profileErrors.email.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="mb-2" htmlFor="targetScore">Mục tiêu điểm số</Label>
                                <Input
                                    id="targetScore"
                                    type="number"
                                    {...register('targetScore')}
                                    placeholder="VD: 850"
                                    min={0}
                                    max={990}
                                    step={5}
                                />
                                {profileErrors.targetScore && (
                                    <p className="text-sm text-red-500 mt-1">{profileErrors.targetScore.message}</p>
                                )}
                            </div>

                            <div>
                                <Label className="mb-2" htmlFor="examDate">Ngày dự thi</Label>
                                <Input
                                    id="examDate"
                                    type="date"
                                    {...register('examDate')}
                                    defaultValue={
                                        user?.examDate ? dayjs(user.examDate).format('YYYY-MM-DD') : ''
                                    }
                                />
                                {profileErrors.examDate && (
                                    <p className="text-sm text-red-500 mt-1">{profileErrors.examDate.message}</p>
                                )}
                            </div>

                        </div>
                        <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-500" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật hồ sơ'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Đổi mật khẩu</CardTitle>
                    <CardDescription>Tăng bảo mật tài khoản của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordSubmit(onSubmitPassword)} className="space-y-4">
                        <div>
                            <Label className='mb-2'>Mật khẩu hiện tại</Label>
                            <Input type="password" {...pwRegister('currentPassword')} />
                            {passwordErrors.currentPassword && <p className="text-red-500 text-sm">{passwordErrors.currentPassword.message}</p>}
                        </div>
                        <div>
                            <Label className='mb-2'>Mật khẩu mới</Label>
                            <Input type="password" {...pwRegister('newPassword')} />
                            {passwordErrors.newPassword && <p className="text-red-500 text-sm">{passwordErrors.newPassword.message}</p>}
                        </div>
                        <div>
                            <Label className='mb-2'>Xác nhận mật khẩu</Label>
                            <Input type="password" {...pwRegister('confirmPassword')} />
                            {passwordErrors.confirmPassword && <p className="text-red-500 text-sm">{passwordErrors.confirmPassword.message}</p>}
                        </div>

                        <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-500" disabled={pwSubmitting}>
                            {pwSubmitting ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default ProfileCard;
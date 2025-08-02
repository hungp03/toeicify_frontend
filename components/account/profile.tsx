'use client';

import { useEffect, useState } from 'react';
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
import { toast } from 'sonner';
import { ErrorCode } from '@/lib/constants';
import { updateUserPassword } from '@/lib/api/user';

const ProfileCard = () => {
    const user = useAuthStore((s) => s.user);
    const updateUser = useAuthStore((s) => s.updateUser);
    const [hasChanges, setHasChanges] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
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

    // Watch tất cả các field để theo dõi thay đổi
    const watchedValues = watch();

    useEffect(() => {
        if (user) {
            setValue('fullName', user.fullName || '');
            setValue('username', user.username || '');
            setValue('email', user.email || '');
            setValue('targetScore', String(user.targetScore ?? 600));
            setValue('examDate', user.examDate ? dayjs(user.examDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'));
        }
    }, [user, setValue]);

    // Theo dõi thay đổi trong form
    useEffect(() => {
        if (!user) return;

        const originalValues = {
            fullName: user.fullName || '',
            username: user.username || '',
            email: user.email || '',
            targetScore: String(user.targetScore ?? 600),
            examDate: user.examDate ? dayjs(user.examDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        };

        const currentValues = {
            fullName: watchedValues.fullName || '',
            username: watchedValues.username || '',
            email: watchedValues.email || '',
            targetScore: watchedValues.targetScore || '',
            examDate: watchedValues.examDate || '',
        };

        // So sánh giá trị hiện tại với giá trị gốc
        const isChanged = Object.keys(originalValues).some(
            (key) => originalValues[key as keyof typeof originalValues] !== currentValues[key as keyof typeof currentValues]
        );

        setHasChanges(isChanged);
    }, [watchedValues, user]);

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
            setHasChanges(false); // Reset trạng thái thay đổi sau khi cập nhật thành công
        } catch (error: any) {
            if (error.code === ErrorCode.RESOURCE_ALREADY_EXISTS) {
                if (error.message.includes("Username is already in use")) {
                    toast.error("Username đã tồn tại. Vui lòng chọn username khác.")
                }
                if (error.message.includes("Email is already in use")) {
                    toast.error("Email đã được sử dụng. Vui lòng sử dụng email khác.")
                }
            }
            else {
                toast.error('Cập nhật hồ sơ thất bại. Vui lòng thử lại sau.', {
                    duration: 3000,
                });
            }
        }
    };

    const onSubmitPassword = async (data: ChangePasswordFormData) => {
        try {
            await updateUserPassword(data.currentPassword, data.newPassword, data.confirmPassword);
            toast.success('Đổi mật khẩu thành công');
            resetPasswordForm();
        } catch (error: any) {
            if (error.code === ErrorCode.BAD_CREDENTIALS) {
                toast.error('Mật khẩu hiện tại không chính xác');
            } else if (error.code === ErrorCode.RESOURCE_INVALID) {
                toast.error("Tài khoản chưa thiết lập mật khẩu, vui lòng sử dụng tính năng quên mật khẩu để thiết lập mật khẩu mới.");
            }
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
                                    min={dayjs().format('YYYY-MM-DD')}
                                />
                                {profileErrors.examDate && (
                                    <p className="text-sm text-red-500 mt-1">{profileErrors.examDate.message}</p>
                                )}
                            </div>
                        </div>
                        
                        {hasChanges && (
                            <Button 
                                type="submit" 
                                className="w-full bg-blue-600 text-white hover:bg-blue-500" 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật hồ sơ'}
                            </Button>
                        )}
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
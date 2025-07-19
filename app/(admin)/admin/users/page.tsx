'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Search, UserCheck, UserX, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const AdminUsers = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const users = [
        { id: 1, name: 'Nguyễn Văn A', email: 'a@example.com', status: 'active', joinDate: '2024-01-15', testsCompleted: 12 },
        { id: 2, name: 'Trần Thị B', email: 'b@example.com', status: 'inactive', joinDate: '2024-02-10', testsCompleted: 8 },
        { id: 3, name: 'Lê Văn C', email: 'c@example.com', status: 'active', joinDate: '2024-03-05', testsCompleted: 15 },
        { id: 4, name: 'Phạm Thị D', email: 'd@example.com', status: 'banned', joinDate: '2024-01-20', testsCompleted: 3 },
        { id: 5, name: 'Hoàng Văn E', email: 'e@example.com', status: 'active', joinDate: '2024-02-28', testsCompleted: 20 },
    ];

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { label: 'Hoạt động', variant: 'default' as const },
            inactive: { label: 'Không hoạt động', variant: 'secondary' as const },
            banned: { label: 'Bị khóa', variant: 'destructive' as const },
        };
        return statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    };

    const handleToggleStatus = (userId: number, currentStatus: string) => {
        toast.info(`Chuyển trạng thái người dùng ${userId} từ ${currentStatus}`);
        // TODO: Gọi API toggle hoặc update state
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
                <p className="text-gray-600 mt-2">Quản lý tài khoản và trạng thái người dùng</p>
            </div>

            {/* Search + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <Card>
                        <CardContent className="p-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Tìm kiếm theo tên hoặc email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                            <p className="text-sm text-gray-600">Tổng người dùng</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách người dùng</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='text-center'>Tên</TableHead>
                                <TableHead className='text-center'>Email</TableHead>
                                <TableHead className='text-center'>Trạng thái</TableHead>
                                <TableHead className='text-center'>Ngày tham gia</TableHead>
                                <TableHead className='text-center'>Bài thi hoàn thành</TableHead>
                                <TableHead>Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => {
                                const statusConfig = getStatusBadge(user.status);
                                return (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell >{user.email}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={statusConfig.variant}>
                                                {statusConfig.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className='text-center'>{user.joinDate}</TableCell>
                                        <TableCell className='text-center'>{user.testsCompleted}</TableCell>
                                        <TableCell>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-[70%]"
                                                    onClick={() => handleToggleStatus(user.id, user.status)}
                                                >
                                                    {user.status === 'active' ? (
                                                        <>
                                                            <UserX className="h-4 w-4 mr-1" />
                                                            Khóa
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserCheck className="h-4 w-4 mr-1" />
                                                            Mở khóa
                                                        </>
                                                    )}
                                                </Button>
                                                <Button variant="ghost" size="sm" className="w-full">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </div>

                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminUsers;

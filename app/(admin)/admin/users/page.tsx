'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Search, UserCheck, UserX, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getUsers, toggleUserStatus } from '@/lib/api/user';
import { Pagination } from '@/components/common/pagination';
import { AdminUpdateUser } from '@/types/user.d';

const AdminUsers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<AdminUpdateUser[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUpdateUser | null>(null);
    const [lockReason, setLockReason] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getUsers(page, 20, searchTerm);
            console.log('API Response:', JSON.stringify(response.data, null, 2));
            const { result, meta } = response.data;
            if (!Array.isArray(result) || !meta) {
                throw new Error('Invalid API response structure');
            }
            setUsers(result);
            setTotalUsers(meta.total);
            setTotalPages(meta.pages);
            setError(null);
        } catch (err: any) {
            console.error('Fetch Users Error:', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message,
            });
            const errorMessage = err.response?.data?.message || err.message || 'Không thể tải danh sách người dùng';
            setError(errorMessage);
            toast.error(`Lỗi khi tải danh sách người dùng: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, searchTerm]);

    const getStatusBadge = (isActive: boolean) => {
        return isActive
            ? { label: 'Hoạt động', variant: 'default' as const }
            : { label: 'Bị khóa', variant: 'destructive' as const };
    };

    const handleToggleStatus = async (user: AdminUpdateUser) => {
        if (user.isActive) {
            // Kiểm tra nếu vai trò là Administrator
            if (user.roleName === 'Administrator') {
                toast.error('Không thể khóa tài khoản Administrator');
                return;
            }
            // Mở dialog để nhập lý do khóa
            setSelectedUser(user);
            setIsLockDialogOpen(true);
        } else {
            // Mở khóa không cần lý do
            try {
                await toggleUserStatus(user.userId);
                toast.success(`Đã mở khóa người dùng ${user.userId}`);
                fetchUsers();
            } catch (err: any) {
                console.error('Toggle Status Error:', {
                    status: err.response?.status,
                    data: err.response?.data,
                    message: err.message,
                });
                const errorMessage = err.response?.data?.message || err.message || 'Không thể chuyển trạng thái người dùng';
                toast.error(`Lỗi khi chuyển trạng thái người dùng: ${errorMessage}`);
            }
        }
    };

    const confirmLockUser = async () => {
        if (!selectedUser) return;
        try {
            await toggleUserStatus(selectedUser.userId, lockReason);
            toast.success(`Đã khóa người dùng ${selectedUser.userId}`);
            setIsLockDialogOpen(false);
            setLockReason('');
            setSelectedUser(null);
            fetchUsers();
        } catch (err: any) {
            console.error('Toggle Status Error:', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message,
            });
            const errorMessage = err.response?.data?.message || err.message || 'Không thể khóa người dùng';
            toast.error(`Lỗi khi khóa người dùng: ${errorMessage}`);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
                <p className="text-gray-600 mt-2">Quản lý tài khoản và trạng thái người dùng</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3">
                    <Card>
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Tìm kiếm theo username hoặc email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
                            <p className="text-sm text-gray-600">Tổng người dùng</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách người dùng</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center">Đang tải...</div>
                    ) : error ? (
                        <div className="text-center text-red-500">{error}</div>
                    ) : (
                        <>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-center break-words whitespace-normal max-w-[150px]">Tên dùng</TableHead>
                                <TableHead className="text-center break-words whitespace-normal max-w-[180px]">Email</TableHead>
                                <TableHead className="text-center">Vai trò</TableHead>
                                <TableHead className="text-center">Trạng thái</TableHead>
                                <TableHead className="text-center">Ngày đăng ký</TableHead>
                                <TableHead className="text-center">Điểm mục tiêu</TableHead>
                                <TableHead className="text-center">Ngày thi</TableHead>
                                <TableHead className="text-center break-words whitespace-normal max-w-[200px]">Lý do khóa</TableHead>
                                <TableHead className="text-center">Hành động</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {users.map((user) => {
                                const statusConfig = getStatusBadge(user.isActive);
                                return (
                                  <TableRow key={user.userId}>
                                    <TableCell className="break-words whitespace-normal max-w-[150px] p-2">
                                      {user.fullName}
                                    </TableCell>
                                    <TableCell className="break-words whitespace-normal max-w-[180px] p-2">
                                      {user.email}
                                    </TableCell>
                                    <TableCell className="text-center p-2">
                                      {user.roleName ?? 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-center p-2">
                                      <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center p-2">
                                      {new Date(user.registrationDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-center p-2">
                                      {user.targetScore ?? 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-center p-2">
                                      {user.examDate ? new Date(user.examDate).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                    <TableCell className="break-words whitespace-normal max-w-[200px] text-center p-2">
                                      {user.lockReason ?? 'N/A'}
                                    </TableCell>
                                    <TableCell className="p-2">
                                      <div className="grid grid-cols-2 gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-[70%]"
                                          onClick={() => handleToggleStatus(user)}
                                          disabled={user.roleName === 'Administrator' && user.isActive}
                                        >
                                          {user.isActive ? (
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

                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={(newPage) => setPage(newPage)}
                                />
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isLockDialogOpen} onOpenChange={setIsLockDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Khóa tài khoản</DialogTitle>
                        <DialogDescription>
                            Vui lòng nhập lý do khóa tài khoản của người dùng{' '}
                            <strong>{selectedUser?.fullName}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        placeholder="Nhập lý do khóa..."
                        value={lockReason}
                        onChange={(e) => setLockReason(e.target.value)}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLockDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button
                            onClick={confirmLockUser}
                            disabled={!lockReason.trim()}
                        >
                            Xác nhận khóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminUsers;
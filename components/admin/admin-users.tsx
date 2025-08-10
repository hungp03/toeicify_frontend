'use client';

import { useCallback, useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import {
    Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Search, UserCheck, UserX, Loader } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getUsers, toggleUserStatus } from '@/lib/api/user';
import { Pagination } from '@/components/common/pagination';
import type { AdminUpdateUser } from '@/types';

export function AdminUsersContent() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [users, setUsers] = useState<AdminUpdateUser[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUpdateUser | null>(null);
    const [lockReason, setLockReason] = useState('');
    const [lastFetchKey, setLastFetchKey] = useState('');

    // Fetch users function
    const fetchUsers = async (pageValue: number, term: string) => {
        setLoading(true);
        try {
            const trimmedTerm = term.trim();
            const { data } = trimmedTerm
                ? await getUsers(pageValue, 20, trimmedTerm)
                : await getUsers(pageValue, 20);

            const { result, meta } = data;
            setUsers(result);
            setTotalUsers(meta.total);
            setTotalPages(meta.pages);
            setError(null);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Lỗi khi tải danh sách người dùng';
            toast.error(message);
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search term
    const debouncedSetSearch = useCallback(
        debounce((value: string) => {
            setDebouncedSearchTerm(value);
            setPage(0); // Reset page when search changes
        }, 1000),
        []
    );

    // Handle search input change
    useEffect(() => {
        debouncedSetSearch(searchTerm);
        return () => {
            debouncedSetSearch.cancel();
        };
    }, [searchTerm, debouncedSetSearch]);

    // Main effect - chỉ chạy khi debouncedSearchTerm hoặc page thay đổi
    useEffect(() => {
        const fetchKey = `${page}-${debouncedSearchTerm}`;
        if (fetchKey !== lastFetchKey) {
            setLastFetchKey(fetchKey);
            fetchUsers(page, debouncedSearchTerm);
        }
    }, [page, debouncedSearchTerm, lastFetchKey]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleToggleStatus = (user: AdminUpdateUser) => {
        if (user.isActive && user.roleName === 'Administrator') {
            toast.error('Không thể khóa tài khoản Administrator');
            return;
        }

        if (user.isActive) {
            setSelectedUser(user);
            setIsDialogOpen(true);
        } else {
            toggleUser(user);
        }
    };

    const toggleUser = async (user: AdminUpdateUser, reason?: string) => {
        try {
            await toggleUserStatus(user.userId, reason);
            const updated = users.map(u =>
                u.userId === user.userId
                    ? {
                        ...u,
                        isActive: !u.isActive,
                        lockReason: reason || undefined,
                    }
                    : u,
            );
            setUsers(updated);
            toast.success(`${user.isActive ? 'Đã khóa' : 'Đã mở khóa'} ${user.fullName}`);
        } catch {
            toast.error('Thao tác thất bại, vui lòng thử lại.');
        }
    };

    const confirmLock = () => {
        if (!selectedUser) return;
        toggleUser(selectedUser, lockReason);
        setIsDialogOpen(false);
        setLockReason('');
        setSelectedUser(null);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
                <p className="text-gray-600">Theo dõi và điều chỉnh trạng thái người dùng</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3">
                    <Card>
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Tìm kiếm theo tên hoặc email"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
                        <p className="text-sm text-gray-600">Tổng người dùng</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách người dùng</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader className="h-6 w-6 text-gray-500 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-8">{error}</div>
                    ) : users.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">Không có người dùng nào theo tìm kiếm</div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tên</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Vai trò</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Ngày đăng ký</TableHead>
                                        <TableHead>Lý do khóa</TableHead>
                                        <TableHead>Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.userId}>
                                            <TableCell>{user.fullName}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.roleName || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.isActive ? 'default' : 'destructive'}>
                                                    {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(user.registrationDate).toLocaleDateString()}</TableCell>
                                            <TableCell className="whitespace-pre-wrap max-w-[200px]">{user.lockReason || '—'}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleToggleStatus(user)}
                                                    disabled={user.roleName === 'Administrator' && user.isActive}
                                                >
                                                    {user.isActive ? (
                                                        <UserX className="h-4 w-4 mr-1" />
                                                    ) : (
                                                        <UserCheck className="h-4 w-4 mr-1" />
                                                    )}
                                                    {user.isActive ? 'Khóa' : 'Mở'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Khóa người dùng</DialogTitle>
                        <DialogDescription>
                            Nhập lý do khóa tài khoản <strong>{selectedUser?.fullName}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <Input
                        placeholder="Lý do khóa..."
                        value={lockReason}
                        onChange={(e) => setLockReason(e.target.value)}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                        <Button onClick={confirmLock} disabled={!lockReason.trim()}>Xác nhận</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export function AdminUsersLoading() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
                <p className="text-gray-600">Theo dõi và điều chỉnh trạng thái người dùng</p>
            </div>
            <div className="flex justify-center py-12">
                <Loader className="h-8 w-8 text-gray-500 animate-spin" />
            </div>
        </div>
    );
}
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, UserCheck, UserX, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getUsers, toggleUserStatus } from "@/lib/api/user";
import { Pagination } from "@/components/common/pagination";
import {AdminUpdateUser} from "@/types/user.d"

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<AdminUpdateUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers(page, 20, searchTerm);

      // Kiểm tra lại cấu trúc
      console.log("API Response:", response.data);

      // Lấy dữ liệu chính xác từ response.data
      const { result, meta } = response.data;

      if (!Array.isArray(result) || !meta) {
        throw new Error("Invalid API response structure");
      }

      setUsers(result);
      setTotalUsers(meta.total);
      setTotalPages(meta.pages);
      setError(null);
    } catch (err: any) {
      console.error("Fetch Users Error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể tải danh sách người dùng";
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
      ? { label: "Hoạt động", variant: "default" as const }
      : { label: "Bị khóa", variant: "destructive" as const };
  };

  const handleToggleStatus = async (userId: number, isActive: boolean) => {
    try {
      await toggleUserStatus(userId);
      toast.success(`Đã ${isActive ? "khóa" : "mở khóa"} người dùng ${userId}`);
      fetchUsers();
    } catch (err: any) {
      console.error("Toggle Status Error:", err.response?.data || err.message);
      toast.error(
        `Lỗi khi chuyển trạng thái người dùng: ${err.response?.data?.message || err.message}`,
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
        <p className="text-gray-600 mt-2">
          Quản lý tài khoản và trạng thái người dùng
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
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
          <CardContent className="p-6">
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
                    <TableHead className="text-center">Tên</TableHead>
                    <TableHead className="text-center">Email</TableHead>
                    <TableHead className="text-center">Vai trò</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="text-center">Ngày tham gia</TableHead>
                    <TableHead className="text-center">Điểm mục tiêu</TableHead>
                    <TableHead className="text-center">Ngày thi</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const statusConfig = getStatusBadge(user.isActive);
                    return (
                      <TableRow key={user.userId}>
                        <TableCell className="font-medium">
                          {user.fullName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="text-center">
                          {user.roleName ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {new Date(user.registrationDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {user.targetScore ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-center">
                          {user.examDate
                            ? new Date(user.examDate).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-[70%]"
                              onClick={() =>
                                handleToggleStatus(user.userId, user.isActive)
                              }
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {/* <Pagination
                currentPage={page + 1}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage - 1)}
              /> */}
              {totalPages > 1 && (
                  <Pagination
                    currentPage={page + 1}
                    totalPages={totalPages}
                    onPageChange={(newPage) => setPage(newPage - 1)}
                  />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;

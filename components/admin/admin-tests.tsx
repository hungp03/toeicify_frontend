'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import _ from 'lodash';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import {
  Button
} from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
  Search, Plus, Edit, Trash2, FileText, Eye, RefreshCw, Loader, Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { getAllExams, deleteExam} from '@/lib/api/exam';
import { ExamResponse, PaginationMeta, PaginationResponse, ExamSearchParams} from '@/types';
import { Pagination } from '@/components/common/pagination';

export function AdminTestsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actualSearchTerm, setActualSearchTerm] = useState(''); // The term actually used for API
  const [filterStatus, setFilterStatus] = useState('all');
  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: 10,
    pages: 0,
    total: 0
  });
  const [currentPage, setCurrentPage] = useState(0);

  // Create debounced search function
  const debouncedSearch = useMemo(
    () => _.debounce((searchValue: string) => {
      setActualSearchTerm(searchValue);
      setCurrentPage(0); // Reset to first page when search changes
    }, 1000),
    []
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const loadExams = async (page = 0, keyword?: string) => {
    try {
      setLoading(true);
      const params: ExamSearchParams = {
        page,
        size: pagination.pageSize
      };
      
      if (keyword) {
        params.keyword = keyword;
      }

      console.log('Loading exams with params:', params);

      const response = await getAllExams(params);
      const data: PaginationResponse = response.data;
      
      setExams(data.result);
      setPagination(data.meta);
      setCurrentPage(page);
    } catch (error) {
      toast.error("Lỗi khi tải đề thi, vui lòng thử lại sau.");
      console.error('Error loading exams:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadExams(0);
  }, []);

  // Load when actualSearchTerm changes (after debounce)
  useEffect(() => {
    if (actualSearchTerm !== '' || currentPage > 0) { // Don't reload on initial empty search
      loadExams(0, actualSearchTerm || undefined);
    }
  }, [actualSearchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debouncedSearch(value); // This will update actualSearchTerm after 500ms
  };

  const filteredExams = exams.filter(exam => {
    const examStatus = exam.status?.toLowerCase() || 'draft';
    return filterStatus === 'all' || examStatus === filterStatus;
  });

  const handleDelete = async (examId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đề thi này?')) return;
    try {
      await deleteExam(examId);
      toast.success("Đã xóa đề thi thành công!");
      loadExams(currentPage, actualSearchTerm || undefined);
    } catch (error) {
      toast.error("Không thể xóa đề thi");
      console.error('Error deleting exam:', error);
    }
  };

  const handleRefresh = () => {
    loadExams(currentPage, actualSearchTerm || undefined);
  };

  const handlePageChange = (page: number) => {
    loadExams(page, actualSearchTerm || undefined);
  };

  const getStatusBadge = (status: string | null) => {
    const normalizedStatus = status?.toLowerCase() || 'draft';
    const config = {
      active: { variant: 'default' as const, label: 'Hoạt động' },
      published: { variant: 'default' as const, label: 'Đã xuất bản' },
      public: { variant: 'default' as const, label: 'Công khai' },
      draft: { variant: 'secondary' as const, label: 'Bản nháp' },
      inactive: { variant: 'destructive' as const, label: 'Không hoạt động' },
      archived: { variant: 'destructive' as const, label: 'Đã lưu trữ' },
      private: { variant: 'outline' as const, label: 'Riêng tư' },
    };
    return config[normalizedStatus as keyof typeof config] || config.draft;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Calculate stats
  const totalExams = pagination.total;
  const publishedCount = exams.filter(e => {
    const status = e.status?.toLowerCase() || 'draft';
    return status === 'published' || status === 'active' || status === 'public';
  }).length;
  const draftCount = exams.filter(e => {
    const status = e.status?.toLowerCase() || 'draft';
    return status === 'draft';
  }).length;
  const totalAttempts = 0; // This might need to come from a separate API

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đề thi</h1>
          <p className="text-gray-600 mt-2">Quản lý tất cả đề thi và phần thi</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Link href="/admin/tests/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo đề thi mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{totalExams}</p>
              <p className="text-sm text-gray-600">Tổng đề thi</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">✓</span>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{publishedCount}</p>
              <p className="text-sm text-gray-600">Đã công khai</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 font-bold">●</span>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{draftCount}</p>
              <p className="text-sm text-gray-600">Bản nháp</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center">
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold">#</span>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{totalAttempts}</p>
              <p className="text-sm text-gray-600">Lượt thi</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm đề thi..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10"
            />
            {/* Show loading indicator when search is being debounced */}
            {searchTerm !== actualSearchTerm && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-blue-600" />
            )}
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="public">Công khai</SelectItem>
              <SelectItem value="draft">Bản nháp</SelectItem>
              <SelectItem value="private">Riêng tư</SelectItem>
              <SelectItem value="cancelled">Không hoạt động</SelectItem>
              <SelectItem value="pending">Đang chờ thêm</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Danh sách đề thi
            {actualSearchTerm && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Tìm kiếm: "{actualSearchTerm}")
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader className="h-8 w-8 animate-spin text-gray-500" />
              <span className="ml-2">Đang tải...</span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Tên đề thi</TableHead>
                    <TableHead className="text-center">Danh mục</TableHead>
                    <TableHead className="text-center">Số câu hỏi</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="text-center">Ngày tạo</TableHead>
                    <TableHead className="text-center">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.length > 0 ? (
                    filteredExams.map((exam) => {
                      const status = getStatusBadge(exam.status);
                      return (
                        <TableRow key={exam.examId}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{exam.examName}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {exam.examDescription}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{exam.categoryName}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{exam.totalQuestions} câu</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell className="text-center">{formatDate(exam.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center space-x-2">
                              <Link href={`/admin/tests/${exam.examId}`}>
                                <Button variant="outline" size="sm" title="Xem chi tiết">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/admin/tests/${exam.examId}/edit`}>
                                <Button variant="outline" size="sm" title="Chỉnh sửa">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                title="Xóa"
                                onClick={() => handleDelete(exam.examId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-gray-500">
                          {actualSearchTerm ? (
                            <>
                              <p className="text-lg mb-2">Không tìm thấy đề thi nào phù hợp</p>
                              <p className="text-sm">Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc</p>
                              <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => {
                                  setSearchTerm('');
                                  setActualSearchTerm('');
                                  setFilterStatus('all');
                                  debouncedSearch.cancel();
                                }}
                              >
                                Xóa bộ lọc
                              </Button>
                            </>
                          ) : (
                            <p className="text-lg">Chưa có đề thi nào</p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {pagination.pages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.pages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminTestsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đề thi</h1>
          <p className="text-gray-600 mt-2">Quản lý tất cả đề thi và phần thi</p>
        </div>
      </div>
      <div className="flex justify-center py-12">
        <Loader className="h-8 w-8 text-gray-500 animate-spin" />
      </div>
    </div>
  );
}
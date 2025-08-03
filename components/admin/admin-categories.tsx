'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FolderTree, Edit, Trash2, Loader, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/common/pagination';
import { useCategoryStore } from '@/store/categories';
import { toast } from 'sonner';
import { categorySchema, type CategoryFormData } from '@/lib/schema';
import type { Category } from '@/types';

export function AdminCategoriesContent() {
  const { 
    categories, 
    paginationMeta, 
    fetchCategories, 
    createCategory, 
    updateCategory,
    deleteCategory
  } = useCategoryStore();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const pageSize = 10;

  // Form for adding category
  const addForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryName: '',
      description: ''
    }
  });

  // Form for editing category
  const editForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryName: '',
      description: ''
    }
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsInitialLoading(true);
        await fetchCategories(currentPage, pageSize);
      } catch (error) {
        toast.error('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadCategories();
  }, [fetchCategories, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddCategory = () => {
    addForm.reset({
      categoryName: '',
      description: ''
    });
    setIsAddDialogOpen(true);
  };

  const handleSubmitAdd = async (data: CategoryFormData) => {
    setLoading(true);
    try {
      await createCategory({
        categoryName: data.categoryName.trim(),
        description: data.description?.trim() || ''
      });
      toast.success('Thêm danh mục thành công!');
      setIsAddDialogOpen(false);
      addForm.reset();
      // Refresh current page
      await fetchCategories(currentPage, pageSize);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        toast.error('Danh mục này đã tồn tại. Vui lòng chọn tên khác.');
      } else {
        toast.error('Có lỗi xảy ra khi thêm danh mục');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    editForm.reset({
      categoryName: category.categoryName,
      description: category.description || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmitEdit = async (data: CategoryFormData) => {
    if (!editingCategory) return;

    setLoading(true);
    try {
      await updateCategory(editingCategory.categoryId, {
        categoryName: data.categoryName.trim(),
        description: data.description?.trim() || ''
      });
      toast.success('Cập nhật danh mục thành công!');
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      editForm.reset();
      // Refresh current page
      await fetchCategories(currentPage, pageSize);
    } catch (error: any) {
      if (error.message.includes('must be unique')) {
        toast.error('Danh mục này đã tồn tại. Vui lòng chọn tên khác.');
      } else {
        toast.error('Có lỗi xảy ra khi cập nhật danh mục');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle delete category
  const handleDeleteCategory = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;

    setLoading(true);
    try {
      await deleteCategory(deletingCategory.categoryId);
      toast.success('Xóa danh mục thành công!');
      setIsDeleteDialogOpen(false);
      setDeletingCategory(null);
      // If current page becomes empty after deletion, go to previous page
      if (categories.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else {
        await fetchCategories(currentPage, pageSize);
      }
    } catch (error: any) {
      toast.error("Có lỗi xảy ra khi xóa danh mục. Vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const totalExams = categories.reduce((sum, category) => sum + category.examCount, 0);

  if (isInitialLoading) {
    return <AdminCategoriesLoading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Phân loại đề thi</h1>
          <p className="text-gray-600 mt-2">Quản lý các danh mục và phân loại đề thi</p>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm danh mục
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FolderTree className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {paginationMeta?.total || 0}
                </p>
                <p className="text-sm text-gray-600">Tổng danh mục</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold">#</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{totalExams}</p>
                <p className="text-sm text-gray-600">Tổng đề thi (trang hiện tại)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Danh sách danh mục</span>
            {paginationMeta && (
              <span className="text-sm font-normal text-gray-500">
                Hiển thị {categories.length} / {paginationMeta.total} danh mục
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">ID</TableHead>
                <TableHead className="text-center">Tên danh mục</TableHead>
                <TableHead className="text-center">Mô tả</TableHead>
                <TableHead className="text-center">Số đề thi</TableHead>
                <TableHead className="text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    Không có danh mục nào
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.categoryId}>
                    <TableCell className="text-center font-medium">
                      {category.categoryId}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {category.categoryName}
                    </TableCell>
                    <TableCell className="text-center">
                      {category.description}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={category.examCount > 0 ? 'default' : 'secondary'}>
                        {category.examCount} đề
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCategory(category)}
                          disabled={category.examCount > 0}
                          title={category.examCount > 0 ? 'Không thể xóa danh mục có đề thi' : 'Xóa danh mục'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {paginationMeta && paginationMeta.pages > 1 && (
            <div className="mt-6">
              <Pagination
                totalPages={paginationMeta.pages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                siblingCount={1}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) addForm.reset();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm danh mục mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin để tạo danh mục đề thi mới
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={addForm.handleSubmit(handleSubmitAdd)} className="space-y-4">
            <div>
              <Label className="mb-2" htmlFor="add-name">Tên danh mục *</Label>
              <Input
                id="add-name"
                {...addForm.register('categoryName')}
                placeholder="Nhập tên danh mục..."
              />
              {addForm.formState.errors.categoryName && (
                <p className="text-sm text-red-500 mt-1">
                  {addForm.formState.errors.categoryName.message}
                </p>
              )}
            </div>
            <div>
              <Label className="mb-2" htmlFor="add-description">Mô tả</Label>
              <Textarea
                id="add-description"
                {...addForm.register('description')}
                placeholder="Nhập mô tả danh mục..."
                rows={3}
              />
              {addForm.formState.errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {addForm.formState.errors.description.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang thêm...' : 'Thêm danh mục'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditingCategory(null);
          editForm.reset();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin danh mục "{editingCategory?.categoryName}"
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleSubmitEdit)} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Tên danh mục *</Label>
              <Input
                id="edit-name"
                {...editForm.register('categoryName')}
                placeholder="Nhập tên danh mục..."
              />
              {editForm.formState.errors.categoryName && (
                <p className="text-sm text-red-500 mt-1">
                  {editForm.formState.errors.categoryName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-description">Mô tả</Label>
              <Textarea
                id="edit-description"
                {...editForm.register('description')}
                placeholder="Nhập mô tả danh mục..."
                rows={3}
              />
              {editForm.formState.errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {editForm.formState.errors.description.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa danh mục "{deletingCategory?.categoryName}"?
              <br />
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={loading}>
              {loading ? 'Đang xóa...' : 'Xóa danh mục'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Loading component
export function AdminCategoriesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Phân loại đề thi</h1>
          <p className="text-gray-600 mt-2">Quản lý các danh mục và phân loại đề thi</p>
        </div>
      </div>
      <div className="flex justify-center py-12">
        <Loader className="h-8 w-8 text-gray-500 animate-spin" />
      </div>
    </div>
  );
}
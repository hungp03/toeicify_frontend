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
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AdminCategories = () => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const categories = [
    { id: 1, name: 'TOEIC Practice', description: 'Đề thi luyện tập TOEIC', testsCount: 15, active: true },
    { id: 2, name: 'TOEIC Simulation', description: 'Đề thi mô phỏng TOEIC', testsCount: 8, active: true },
    { id: 3, name: 'Listening Focus', description: 'Đề thi tập trung kỹ năng nghe', testsCount: 12, active: true },
    { id: 4, name: 'Reading Focus', description: 'Đề thi tập trung kỹ năng đọc', testsCount: 10, active: false },
    { id: 5, name: 'Grammar', description: 'Đề thi ngữ pháp', testsCount: 6, active: true },
  ];

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      console.log('Adding category:', newCategoryName);
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleEditCategory = (categoryId: number) => {
    console.log('Edit category:', categoryId);
  };

  const handleDeleteCategory = (categoryId: number) => {
    console.log('Delete category:', categoryId);
  };

  const handleToggleStatus = (categoryId: number) => {
    console.log('Toggle category status:', categoryId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Phân loại đề thi</h1>
          <p className="text-gray-600 mt-2">Quản lý các danh mục và phân loại đề thi</p>
        </div>
        <Button onClick={() => setIsAddingCategory(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm danh mục
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FolderTree className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                <p className="text-sm text-gray-600">Tổng danh mục</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{categories.filter(c => c.active).length}</p>
                <p className="text-sm text-gray-600">Đang hoạt động</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {categories.reduce((sum, c) => sum + c.testsCount, 0)}
                </p>
                <p className="text-sm text-gray-600">Tổng đề thi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Category Form */}
      {isAddingCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Thêm danh mục mới</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên danh mục
                </label>
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nhập tên danh mục..."
                />
              </div>
              <div className="flex space-x-3">
                <Button onClick={handleAddCategory}>Thêm</Button>
                <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
                  Hủy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách danh mục</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Tên danh mục</TableHead>
                <TableHead className="text-center">Mô tả</TableHead>
                <TableHead className="text-center">Số đề thi</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="text-center font-medium">{category.name}</TableCell>
                  <TableCell className="text-center">{category.description}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{category.testsCount} đề</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={category.active ? 'default' : 'secondary'}>
                      {category.active ? 'Hoạt động' : 'Tạm dừng'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(category.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(category.id)}
                      >
                        {category.active ? 'Tạm dừng' : 'Kích hoạt'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCategories;

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

export default function AllExams() {
  const [searchTerm, setSearchTerm] = useState('');
  const [exams, setExams] = useState([
    { id: 'EX001', name: 'TOEIC Practice Test 1', type: 'Listening & Reading', questions: 200, duration: '120 mins', isHidden: false },
    { id: 'EX002', name: 'TOEIC Practice Test 2', type: 'Speaking & Writing', questions: 20, duration: '80 mins', isHidden: true },
  ]);

  const filteredExams = exams.filter(
    (exam) =>
      exam.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleHide = (id: string) => {
    setExams((prevExams) =>
      prevExams.map((exam) =>
        exam.id === id
          ? { ...exam, isHidden: !exam.isHidden }
          : exam
      )
    );
    const exam = exams.find((exam) => exam.id === id);
    toast.success(exam?.isHidden ? `Đã hiển thị đề thi ${exam.name}` : `Đã ẩn đề thi ${exam.name}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tất cả đề thi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Thanh tìm kiếm */}
          <div>
            <Input
              type="text"
              placeholder="Tìm kiếm theo mã đề hoặc tên đề"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          {/* Bảng đề thi */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đề</TableHead>
                <TableHead>Tên đề</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Số câu hỏi</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    Không tìm thấy đề thi.
                  </TableCell>
                </TableRow>
              ) : (
                filteredExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>{exam.id}</TableCell>
                    <TableCell>{exam.name}</TableCell>
                    <TableCell>{exam.type}</TableCell>
                    <TableCell>{exam.questions}</TableCell>
                    <TableCell>{exam.duration}</TableCell>
                    <TableCell>{exam.isHidden ? 'Ẩn' : 'Hiển thị'}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Chỉnh sửa</Button>
                      <Button variant="destructive" size="sm" className="ml-2">Xóa</Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="ml-2"
                        onClick={() => handleToggleHide(exam.id)}
                      >
                        {exam.isHidden ? 'Hiển thị' : 'Ẩn'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
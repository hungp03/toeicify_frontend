'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Students() {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([
    {
      gmail: 'nguyenvana@example.com',
      name: 'Nguyễn Văn A',
      examsTaken: 5,
      isActive: true,
    },
    {
      gmail: 'tranthib@example.com',
      name: 'Trần Thị B',
      examsTaken: 3,
      isActive: false,
    },
  ]);

  const filteredStudents = students.filter((student) =>
    student.gmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleActive = (gmail: string) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.gmail === gmail
          ? { ...student, isActive: !student.isActive }
          : student
      )
    );
    const student = students.find((student) => student.gmail === gmail);
    toast.success(student?.isActive ? `Đã vô hiệu hóa ${student.name}` : `Đã kích hoạt ${student.name}`);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý sinh viên</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Thanh tìm kiếm */}
          <div>
            <Input
              type="text"
              placeholder="Tìm kiếm theo Gmail"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          {/* Danh sách sinh viên */}
          <div className="grid grid-cols-1 gap-4">
            {filteredStudents.length === 0 ? (
              <p className="text-gray-500">Không tìm thấy sinh viên.</p>
            ) : (
              filteredStudents.map((student) => (
                <div key={student.gmail} className="border p-4 rounded flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{student.name}</p>
                    <p>Gmail: {student.gmail}</p>
                    <p>Số bài thi đã làm: {student.examsTaken}</p>
                    <p>Trạng thái: {student.isActive ? 'Kích hoạt' : 'Vô hiệu hóa'}</p>
                  </div>
                  <div className="flex space-x-2">

                    <Button
                      variant={student.isActive ? 'secondary' : 'default'}
                      size="sm"
                      onClick={() => handleToggleActive(student.gmail)}
                    >
                      {student.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
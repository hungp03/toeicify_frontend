import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function AddExam() {
  // Dữ liệu mẫu cho các đề thi đang nhập dở
  const draftExams = [
    {
      id: 'DRAFT001',
      name: 'TOEIC Listening Draft',
      type: 'Listening & Reading',
      description: 'Đề thi luyện tập Listening phần 1',
    },
    {
      id: 'DRAFT002',
      name: 'TOEIC Reading Draft',
      type: 'Reading',
      description: 'Đề thi luyện tập Reading chưa hoàn thiện',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thêm đề thi mới</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Form nhập đề thi mới */}
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Tên đề thi</label>
              <Input
                type="text"
                placeholder="Nhập tên đề thi"
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Loại đề thi</label>
              <Input
                type="text"
                placeholder="Ví dụ: Listening & Reading"
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Mô tả</label>
              <textarea
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                placeholder="Mô tả đề thi"
                rows={4}
              />
            </div>
            <Button type="submit">Thêm đề thi</Button>
          </form>

          {/* Danh sách các đề thi đang nhập dở */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Các đề thi đang nhập dở</h3>
            {draftExams.length === 0 ? (
              <p className="text-gray-500">Không có đề thi nào đang nhập dở.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {draftExams.map((exam) => (
                  <Card key={exam.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{exam.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        <strong>Loại:</strong> {exam.type}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Mô tả:</strong> {exam.description}
                      </p>
                      <div className="mt-4 flex space-x-2">
                        <Button variant="outline" size="sm">
                          Tiếp tục chỉnh sửa
                        </Button>
                        <Button variant="destructive" size="sm">
                          Xóa
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function Blogs() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý blog</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <form className="space-y-4">
            <div>
              <label className=" “‘block text-sm font-medium">Tiêu đề bài viết</label>
              <Input
                type="text"
                placeholder="Nhập tiêu đề bài viết"
                className="mt-1 block w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Nội dung</label>
              <textarea
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                placeholder="Viết nội dung bài blog (hỗ trợ Markdown)"
                rows={6}
              />
            </div>
            <Button type="submit">Đăng bài</Button>
          </form>
          <div>
            <h3 className="text-lg font-semibold">Danh sách bài viết</h3>
            <ul className="list-disc pl-5">
              <li>Mẹo làm bài TOEIC Listening - 2025-07-01</li>
              <li>Cách quản lý thời gian khi làm bài Reading - 2025-06-28</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
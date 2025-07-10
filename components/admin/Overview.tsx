import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Overview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tổng quan</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Chào mừng đến với trang quản trị TOEIC!</p>
        <p>Thống kê nhanh:</p>
        <ul className="list-disc pl-5">
          <li>Tổng số sinh viên: 150</li>
          <li>Tổng số đề thi: 25</li>
          <li>Lượt thi hôm nay: 30</li>
        </ul>
      </CardContent>
    </Card>
  );
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar } from 'lucide-react';

const testHistory = [
  {
    id: 1,
    title: "ETS 2024 Test 1",
    date: "2025-07-05",
    score: 720,
    sections: { listening: 385, reading: 335 },
    timeSpent: "120 phút",
    status: "Hoàn thành",
  },
  {
    id: 2,
    title: "ETS 2024 Test 2",
    date: "2025-07-06",
    score: 680,
    sections: { listening: 350, reading: 330 },
    timeSpent: "118 phút",
    status: "Hoàn thành",
  },
];

export default function TestHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Lịch sử bài làm
        </CardTitle>
        <CardDescription>
          Xem lại các bài luyện bạn đã hoàn thành
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {testHistory.map((t) => (
            <div key={t.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{t.title}</h3>
                <div className="flex gap-2">
                  <Badge variant="secondary">{t.score}/990</Badge>
                  <Badge className="bg-green-100 text-green-800">{t.status}</Badge>
                </div>
              </div>
              <div className="grid md:grid-cols-4 gap-2 text-sm text-gray-600">
                <div>
                  <Calendar className="inline h-4 w-4 mr-1" />
                  {new Date(t.date).toLocaleDateString()}
                </div>
                <div>Nghe: {t.sections.listening}/495</div>
                <div>Đọc: {t.sections.reading}/495</div>
                <div>Thời gian: {t.timeSpent}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

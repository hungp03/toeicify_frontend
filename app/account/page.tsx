"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ProfileCard from '@/components/account/profile';
import { Switch } from '@/components/ui/switch';
import { Bell, Calendar, Award, BookOpen } from 'lucide-react';
import withAuth from '@/hoc/with-auth';

const AccountPage = () => {

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    studyReminders: true,
    weeklyProgress: true,
    marketingEmails: false,
  });

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


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tài khoản của bạn</h1>
            <p className="text-gray-600 mt-2">Quản lý hồ sơ, lịch sử học tập và cài đặt cá nhân</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
              <TabsTrigger value="history">Lịch sử</TabsTrigger>
              <TabsTrigger value="preferences">Thông báo</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="grid md:grid-cols-1 gap-6">
                <ProfileCard />
              </div>
            </TabsContent>

            {/* Lịch sử */}
            <TabsContent value="history" className="space-y-6">
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
                          <div><Calendar className="inline h-4 w-4 mr-1" />{new Date(t.date).toLocaleDateString()}</div>
                          <div>Nghe: {t.sections.listening}/495</div>
                          <div>Đọc: {t.sections.reading}/495</div>
                          <div>Thời gian: {t.timeSpent}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Cài đặt thông báo */}
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Cài đặt thông báo
                  </CardTitle>
                  <CardDescription>
                    Tuỳ chỉnh cách bạn muốn nhận thông báo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    {
                      label: "Nhận email thông báo",
                      desc: "Nhận cập nhật qua email về bài học, điểm số",
                      key: "emailNotifications",
                    },
                    {
                      label: "Nhắc nhở luyện tập",
                      desc: "Nhận nhắc nhở mỗi ngày để duy trì thói quen",
                      key: "studyReminders",
                    },
                    {
                      label: "Tổng kết tuần",
                      desc: "Tổng kết tiến độ học tập vào cuối tuần",
                      key: "weeklyProgress",
                    }
                  ].map((item) => (
                    <div className="flex justify-between items-center" key={item.key}>
                      <div>
                        <h4 className="font-medium">{item.label}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                      <Switch
                        checked={preferences[item.key as keyof typeof preferences]}
                        onCheckedChange={(checked) =>
                          setPreferences((p) => ({ ...p, [item.key]: checked }))
                        }
                      />
                    </div>
                  ))}

                  <Button className="w-full bg-blue-600 text-white hover:bg-blue-500">Lưu thay đổi</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default withAuth(AccountPage);

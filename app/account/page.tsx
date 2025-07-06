"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { User, Mail, Lock, Bell, Calendar, Award, BookOpen } from 'lucide-react';

const AccountPage = () => {
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    currentLevel: "intermediate",
    targetScore: "800",
  });

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

  const achievements = [
    {
      title: "Hoàn thành bài đầu tiên",
      description: "Bạn đã hoàn thành bài luyện đầu tiên",
      date: "2024-01-05",
      icon: "🎯",
    },
    {
      title: "Tăng điểm đáng kể",
      description: "Bạn đã cải thiện 40 điểm so với lần trước",
      date: "2024-01-10",
      icon: "📈",
    },
  ];

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Cập nhật hồ sơ:", profileData);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Yêu cầu đổi mật khẩu");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tài khoản của bạn</h1>
            <p className="text-gray-600 mt-2">Quản lý hồ sơ, lịch sử học tập và cài đặt cá nhân</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
              <TabsTrigger value="history">Lịch sử</TabsTrigger>
              <TabsTrigger value="achievements">Thành tích</TabsTrigger>
              <TabsTrigger value="preferences">Thông báo</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Hồ sơ cá nhân
                    </CardTitle>
                    <CardDescription>
                      Cập nhật thông tin cá nhân và mục tiêu học tập
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName" className='mb-2'>Họ</Label>
                          <Input
                            id="firstName"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData((p) => ({ ...p, firstName: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName" className='mb-2'>Tên</Label>
                          <Input
                            id="lastName"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData((p) => ({ ...p, lastName: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email" className='mb-2'>Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData((p) => ({ ...p, email: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className='mb-2'>Trình độ hiện tại</Label>
                          <Select
                            value={profileData.currentLevel}
                            onValueChange={(val) => setProfileData((p) => ({ ...p, currentLevel: val }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Mới bắt đầu (300-500)</SelectItem>
                              <SelectItem value="intermediate">Trung cấp (500-700)</SelectItem>
                              <SelectItem value="advanced">Nâng cao (700-900)</SelectItem>
                              <SelectItem value="expert">Chuyên sâu (900+)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className='mb-2'>Mục tiêu điểm số</Label>
                          <Select
                            value={profileData.targetScore}
                            onValueChange={(val) => setProfileData((p) => ({ ...p, targetScore: val }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="600">600+</SelectItem>
                              <SelectItem value="700">700+</SelectItem>
                              <SelectItem value="800">800+</SelectItem>
                              <SelectItem value="900">900+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-500">Cập nhật hồ sơ</Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Đổi mật khẩu
                    </CardTitle>
                    <CardDescription>
                      Đặt lại mật khẩu để đảm bảo an toàn
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <Label className='mb-2'>Mật khẩu hiện tại</Label>
                        <Input type="password" />
                      </div>
                      <div>
                        <Label className='mb-2'>Mật khẩu mới</Label>
                        <Input type="password" />
                      </div>
                      <div>
                        <Label className='mb-2'>Xác nhận mật khẩu</Label>
                        <Input type="password" />
                      </div>
                      <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-500">Xác nhận đổi mật khẩu</Button>
                    </form>
                  </CardContent>
                </Card>
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

            {/* Thành tích */}
            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Thành tích học tập
                  </CardTitle>
                  <CardDescription>
                    Cột mốc bạn đã đạt được trong quá trình học
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {achievements.map((a, i) => (
                      <div key={i} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex gap-3 items-start">
                          <div className="text-2xl">{a.icon}</div>
                          <div>
                            <h3 className="font-semibold">{a.title}</h3>
                            <p className="text-sm text-gray-600">{a.description}</p>
                            <p className="text-xs text-gray-500">Đạt ngày {new Date(a.date).toLocaleDateString()}</p>
                          </div>
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

export default AccountPage;

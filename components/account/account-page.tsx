'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileCard from '@/components/account/profile';
import TestHistory from '@/components/account/test-history';
// import NotificationSettingsWrapper from '@/components/account/notification-setting-wrapper';

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tài khoản của bạn</h1>
            <p className="text-gray-600 mt-2">Quản lý hồ sơ, lịch sử học tập và cài đặt cá nhân</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
              <TabsTrigger value="history">Lịch sử</TabsTrigger>
              {/* <TabsTrigger value="preferences">Thông báo</TabsTrigger> */}
            </TabsList>

            <TabsContent value="profile">
              <div className="grid md:grid-cols-1 gap-6">
                <ProfileCard />
              </div>
            </TabsContent>

            <TabsContent value="history">
              <TestHistory />
            </TabsContent>

            {/* <TabsContent value="preferences">
              <NotificationSettingsWrapper />
            </TabsContent> */}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

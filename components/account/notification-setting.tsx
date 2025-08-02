import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

interface NotificationSettingsProps {
  preferences: {
    emailNotifications: boolean;
    studyReminders: boolean;
    weeklyProgress: boolean;
    marketingEmails: boolean;
  };
  onChange: (value: NotificationSettingsProps['preferences']) => void;
}

export default function NotificationSettings({
  preferences,
  onChange,
}: NotificationSettingsProps) {
  const items = [
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
    },
  ];

  return (
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
        {items.map((item) => (
          <div className="flex justify-between items-center" key={item.key}>
            <div>
              <h4 className="font-medium">{item.label}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
            <Switch
              checked={preferences[item.key as keyof typeof preferences]}
              onCheckedChange={(checked) =>
                onChange({ ...preferences, [item.key]: checked })
              }
            />
          </div>
        ))}

        <Button className="w-full bg-blue-600 text-white hover:bg-blue-500">
          Lưu thay đổi
        </Button>
      </CardContent>
    </Card>
  );
}

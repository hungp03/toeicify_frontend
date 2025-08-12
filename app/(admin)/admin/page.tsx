'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, HelpCircle, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {StatItem,ActivityItem,MonthlyDataItem,WeeklyGrowthItem} from '@/types/admin'
import { getAdminOverview } from '@/lib/api/admin';

const AdminDashboard = () => {
  const [data, setData] = useState<{
    stats: StatItem[];
    monthlyData: MonthlyDataItem[];
    weeklyGrowth: WeeklyGrowthItem[];
    recentActivities: ActivityItem[];
  }>({
    stats: [],
    monthlyData: [],
    weeklyGrowth: [],
    recentActivities: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAdminOverview();
        setData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  const iconMap: { [key: string]: any } = {
    'Tổng người dùng': Users,
    'Số đề thi': FileText,
    'Số câu hỏi': HelpCircle,
    'Tăng trưởng': TrendingUp,
  };
  const colorMap: { [key: string]: any } = {
    'Tổng người dùng': 'text-blue-600',
    'Số đề thi': 'text-green-600',
    'Số câu hỏi': 'text-purple-600',
    'Tăng trưởng': 'text-orange-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tổng quan hệ thống</h1>
        <p className="text-gray-600 mt-2">Thống kê và báo cáo tổng quan về hệ thống</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.stats.map((stat) => {
          const Icon = iconMap[stat.title] || Users; // Mặc định là Users nếu không tìm thấy
          const Color = colorMap[stat.title] || 'text-gray-600';
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${Color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thống kê theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#3b82f6" name="Người dùng" />
                <Bar dataKey="tests" fill="#10b981" name="Đề thi" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tăng trưởng người dùng (7 ngày)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.weeklyGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.user}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
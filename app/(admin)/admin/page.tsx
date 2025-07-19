'use client';

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

const AdminDashboard = () => {
  const stats = [
    { title: 'Tổng người dùng', value: '1,234', icon: Users, change: '+12%', color: 'text-blue-600' },
    { title: 'Số đề thi', value: '89', icon: FileText, change: '+5%', color: 'text-green-600' },
    { title: 'Số câu hỏi', value: '2,450', icon: HelpCircle, change: '+18%', color: 'text-purple-600' },
    { title: 'Tăng trưởng', value: '15%', icon: TrendingUp, change: '+3%', color: 'text-orange-600' },
  ];

  const monthlyData = [
    { name: 'Jan', users: 400, tests: 20 },
    { name: 'Feb', users: 600, tests: 25 },
    { name: 'Mar', users: 800, tests: 30 },
    { name: 'Apr', users: 1000, tests: 35 },
    { name: 'May', users: 1200, tests: 40 },
    { name: 'Jun', users: 1234, tests: 45 },
  ];

  const weeklyGrowth = [
    { name: 'Mon', value: 20 },
    { name: 'Tue', value: 35 },
    { name: 'Wed', value: 45 },
    { name: 'Thu', value: 30 },
    { name: 'Fri', value: 60 },
    { name: 'Sat', value: 55 },
    { name: 'Sun', value: 40 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tổng quan hệ thống</h1>
        <p className="text-gray-600 mt-2">Thống kê và báo cáo tổng quan về hệ thống</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className={`text-sm mt-1 ${stat.color}`}>{stat.change} so với tháng trước</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
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
              <BarChart data={monthlyData}>
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
              <LineChart data={weeklyGrowth}>
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
            {[
              { action: 'Người dùng mới đăng ký', user: 'user123@example.com', time: '5 phút trước' },
              { action: 'Đề thi mới được tạo', user: 'Admin', time: '15 phút trước' },
              { action: 'Câu hỏi được thêm vào ngân hàng', user: 'Teacher01', time: '30 phút trước' },
              { action: 'Người dùng hoàn thành bài thi', user: 'student456@example.com', time: '1 giờ trước' },
            ].map((activity, index) => (
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

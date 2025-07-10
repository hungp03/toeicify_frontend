'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { LayoutDashboard, Users, FilePlus, BookOpen, BarChart, FileText } from 'lucide-react';
import Overview from '@/components/admin/Overview';
import Students from '@/components/admin/Students';
import AddExam from '@/components/admin/AddExams';
import Blogs from '@/components/admin/Blogs';
import AllExams from '@/components/admin/AllExams';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'students':
        return <Students />;
      case 'add-exam':
        return <AddExam />;
      case 'blogs':
        return <Blogs />;
      case 'all-exams':
        return <AllExams />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-xl font-bold">Quản trị TOEIC</h1>
        </div>
        <Separator />
        <ScrollArea className="h-[calc(100vh-60px)]">
          <div className="p-4 space-y-2">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Tổng quan
            </Button>
            <Button
              variant={activeTab === 'students' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('students')}
            >
              <Users className="mr-2 h-4 w-4" />
              Sinh viên
            </Button>
            <Button
              variant={activeTab === 'add-exam' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('add-exam')}
            >
              <FilePlus className="mr-2 h-4 w-4" />
              Thêm đề
            </Button>

            <Button
              variant={activeTab === 'blogs' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('blogs')}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Blog
            </Button>

            <Button
              variant={activeTab === 'all-exams' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('all-exams')}
            >
              <FilePlus className="mr-2 h-4 w-4" />
              Tất cả đề thi
            </Button>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}
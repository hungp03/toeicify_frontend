'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Clock, Users, Star, Filter, Search,
} from 'lucide-react';

export default function PracticeTestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const practiceTests = [
    {
      id: 1,
      title: 'New Economy 2021 - Test 1',
      description: 'Đề luyện thi chuẩn format TOEIC Listening & Reading',
      level: 'intermediate',
      duration: '120 phút',
      questions: 200,
      difficulty: 'Trung bình',
      participants: 2143,
      rating: 4.8,
      sections: ['Listening', 'Reading'],
    },
    {
      id: 2,
      title: 'New Economy 2021 - Test 2',
      description: 'Đề luyện sát thực tế với phân tích chi tiết',
      level: 'intermediate',
      duration: '120 phút',
      questions: 200,
      difficulty: 'Trung bình',
      participants: 1987,
      rating: 4.7,
      sections: ['Listening', 'Reading'],
    },
    {
      id: 3,
      title: 'ETS Official 2022 - Test 1',
      description: 'Đề thi thật do ETS phát hành chính thức',
      level: 'advanced',
      duration: '120 phút',
      questions: 200,
      difficulty: 'Khó',
      participants: 3264,
      rating: 4.9,
      sections: ['Listening', 'Reading'],
    },
    {
      id: 4,
      title: 'ETS Official 2022 - Test 2',
      description: 'Tài liệu gốc từ ETS giúp ôn luyện nâng cao',
      level: 'advanced',
      duration: '120 phút',
      questions: 200,
      difficulty: 'Khó',
      participants: 2765,
      rating: 4.9,
      sections: ['Listening', 'Reading'],
    },
    {
      id: 5,
      title: 'New Economy - Mini Test Listening',
      description: 'Bài mini test luyện phần Listening TOEIC',
      level: 'beginner',
      duration: '45 phút',
      questions: 100,
      difficulty: 'Dễ',
      participants: 1432,
      rating: 4.5,
      sections: ['Listening'],
    },
    {
      id: 6,
      title: 'New Economy - Mini Test Reading',
      description: 'Bài mini test luyện kỹ năng đọc hiểu TOEIC',
      level: 'beginner',
      duration: '45 phút',
      questions: 100,
      difficulty: 'Dễ',
      participants: 1288,
      rating: 4.6,
      sections: ['Reading'],
    },
  ];

  const filteredTests = practiceTests.filter((test) => {
    const matchSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLevel = selectedLevel === 'all' || test.level === selectedLevel;
    return matchSearch && matchLevel;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-500';
      case 'intermediate':
        return 'bg-yellow-500';
      case 'advanced':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Dễ':
        return 'text-green-600 bg-green-50';
      case 'Trung bình':
        return 'text-yellow-600 bg-yellow-50';
      case 'Khó':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bộ đề luyện TOEIC
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Luyện tập với các đề thi chuẩn từ bộ New Economy và ETS chính thức.
          </p>
        </div>

        {/* Bộ lọc */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Tìm đề luyện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Trình độ:</span>
              </div>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="beginner">Sơ cấp</SelectItem>
                  <SelectItem value="intermediate">Trung cấp</SelectItem>
                  <SelectItem value="advanced">Nâng cao</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Danh sách đề */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className={`${getLevelColor(test.level)} text-white mb-2`}>
                      {test.level === 'beginner'
                        ? 'Sơ cấp'
                        : test.level === 'intermediate'
                          ? 'Trung cấp'
                          : 'Nâng cao'}
                    </Badge>
                    <CardTitle className="text-xl mb-2">{test.title}</CardTitle>
                    <CardDescription>{test.description}</CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {test.sections.map((section) => (
                    <Badge key={section} variant="outline" className="text-xs">
                      {section}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {test.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {test.participants} lượt làm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{test.questions} câu hỏi</span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      {test.rating}
                    </span>
                  </div>
                  <Badge className={getDifficultyColor(test.difficulty)}>
                    {test.difficulty}
                  </Badge>
                </div>
                <div className="mt-6">
                  <Link href={`/practice-tests/${test.id}`} className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white">Bắt đầu luyện đề</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Không tìm thấy đề phù hợp với tiêu chí của bạn.</p>
          </div>
        )}
      </div>
    </div>
  );
}

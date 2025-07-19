'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Database, Image, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AdminQuestions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPart, setFilterPart] = useState('all');

  const questions = [
    {
      id: 1,
      part: '1',
      type: 'Photograph',
      question: 'What is the man doing?',
      hasImage: true,
      hasAudio: true,
      difficulty: 'Easy',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      part: '2',
      type: 'Question-Response',
      question: 'Where are you going?',
      hasImage: false,
      hasAudio: true,
      difficulty: 'Medium',
      createdAt: '2024-01-20'
    },
    {
      id: 3,
      part: '5',
      type: 'Incomplete Sentence',
      question: 'The meeting will _____ at 3 PM.',
      hasImage: false,
      hasAudio: false,
      difficulty: 'Easy',
      createdAt: '2024-02-01'
    },
    {
      id: 4,
      part: '6',
      type: 'Text Completion',
      question: 'Complete the text about business...',
      hasImage: false,
      hasAudio: false,
      difficulty: 'Hard',
      createdAt: '2024-02-10'
    },
    {
      id: 5,
      part: '7',
      type: 'Reading Comprehension',
      question: 'Read the passage and answer...',
      hasImage: true,
      hasAudio: false,
      difficulty: 'Medium',
      createdAt: '2024-02-15'
    }
  ];

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPart = filterPart === 'all' || q.part === filterPart;
    return matchesSearch && matchesPart;
  });

  const getDifficultyBadge = (difficulty: string) => {
    const map: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'destructive' }
    > = {
      Easy: { label: 'Dễ', variant: 'default' },
      Medium: { label: 'Trung bình', variant: 'secondary' },
      Hard: { label: 'Khó', variant: 'destructive' }
    };
    return map[difficulty as keyof typeof map] || map.Easy;
  };

  const getPartTypeName = (part: string) => {
    const map: Record<string, string> = {
      '1': 'Photographs',
      '2': 'Question-Response',
      '3': 'Conversations',
      '4': 'Talks',
      '5': 'Incomplete Sentences',
      '6': 'Text Completion',
      '7': 'Reading Comprehension'
    };
    return map[part] || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ngân hàng câu hỏi</h1>
          <p className="text-gray-600 mt-2">Quản lý tất cả câu hỏi trong hệ thống</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Thêm câu hỏi
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
                <p className="text-sm text-gray-600">Tổng câu hỏi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Image className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {questions.filter((q) => q.hasImage).length}
                </p>
                <p className="text-sm text-gray-600">Có hình ảnh</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Volume2 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {questions.filter((q) => q.hasAudio).length}
                </p>
                <p className="text-sm text-gray-600">Có âm thanh</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold">7</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">7</p>
                <p className="text-sm text-gray-600">Phần thi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm câu hỏi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterPart} onValueChange={setFilterPart}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Chọn phần thi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phần</SelectItem>
                {Array.from({ length: 7 }, (_, i) => (
                  <SelectItem key={i + 1} value={`${i + 1}`}>
                    Part {i + 1} - {getPartTypeName(`${i + 1}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách câu hỏi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Part</TableHead>
                <TableHead className="text-center">Loại</TableHead>
                <TableHead className="text-center">Câu hỏi</TableHead>
                <TableHead className="text-center">Media</TableHead>
                <TableHead className="text-center">Độ khó</TableHead>
                <TableHead className="text-center">Ngày tạo</TableHead>
                <TableHead className="text-center">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.map((q) => {
                const badge = getDifficultyBadge(q.difficulty);
                return (
                  <TableRow key={q.id}>
                    <TableCell className="text-center">
                      <Badge variant="outline">Part {q.part}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{getPartTypeName(q.part)}</TableCell>
                    <TableCell className="text-center max-w-xs truncate">{q.question}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-2">
                        {q.hasImage && <Image className="h-4 w-4 text-green-600" />}
                        {q.hasAudio && <Volume2 className="h-4 w-4 text-blue-600" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{q.createdAt}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminQuestions;

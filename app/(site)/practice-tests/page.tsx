'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { toast } from 'sonner';
import {
  Clock, Users, Search, Filter,
} from 'lucide-react';
import { getAllExams } from '@/lib/api/exam';
import { PracticeTests } from '@/types/exam';
import { Pagination } from '@/components/common/pagination';

const PracticeTestsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('keyword') ?? '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') ?? 'all');
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    const pageNumber = pageParam ? parseInt(pageParam, 10) : 1;
    return Math.max(0, pageNumber - 1);
  });
  const [practiceTests, setPracticeTests] = useState<PracticeTests[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const updateURL = (keyword: string, categoryId: string, page: number) => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (categoryId !== 'all') params.set('categoryId', categoryId);
    params.set('page', String(page + 1));
    router.push(`/practice-tests?${params.toString()}`);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllExams({
        page: currentPage,
        size: 1,
        keyword: searchTerm || undefined,
        categoryId: selectedCategory !== 'all' ? Number(selectedCategory) : undefined,
      });
      setPracticeTests(res.data?.result || []);
      setTotalPages(res.data?.meta?.pages || 1);
    } catch (err) {
      toast.error('Đã xảy ra lỗi khi tải đề thi!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm, selectedCategory]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
    updateURL(value, selectedCategory, 0);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(0);
    updateURL(searchTerm, value, 0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL(searchTerm, selectedCategory, page);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bộ đề luyện TOEIC</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Luyện tập với các đề thi chuẩn từ bộ New Economy và ETS chính thức.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Tìm đề luyện..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Loại đề:</span>
              </div>
              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="1">New Economy</SelectItem>
                  <SelectItem value="2">ETS Official</SelectItem>
                  {/* TODO: Có thể load từ API nếu cần */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practiceTests.map((test) => (
            <Card key={test.examId} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className={`bg-green-100 text-blue-600 mb-2`}>
                      #{test.categoryName}
                    </Badge>
                    <CardTitle className="text-xl mb-2">{test.examName}</CardTitle>
                    <CardDescription>{test.examDescription}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      120 phút
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      lượt làm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{test.totalQuestions} câu hỏi</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Link href={`/practice-tests/${test.examId}`} className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                      Bắt đầu luyện đề
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!loading && practiceTests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Không tìm thấy đề phù hợp với tiêu chí của bạn.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeTestsPage;

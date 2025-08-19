'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import _ from 'lodash';
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
import { Search, Filter, Loader2} from 'lucide-react';
import { getAllExamsForClient } from '@/lib/api/exam';
import { PracticeTests } from '@/types/exam';
import { Pagination } from '@/components/common/pagination';
import { useCategoryStore } from '@/store/categories';

export const PracticeTestsLoading = () => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Bộ đề luyện TOEIC</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Luyện tập với các đề thi chuẩn từ bộ New Economy và ETS chính thức.
        </p>
      </div>
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Đang tải...</span>
      </div>
    </div>
  </div>
);

const PracticeTestsList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [searchTerm, setSearchTerm] = useState('');
  const [actualSearchTerm, setActualSearchTerm] = useState(''); // The term actually used for API
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [practiceTests, setPracticeTests] = useState<PracticeTests[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  const { categories, fetchCategories } = useCategoryStore();

  // Create debounced search function
  const debouncedSearch = useMemo(
    () => _.debounce((searchValue: string) => {
      setActualSearchTerm(searchValue);
      setCurrentPage(0); // Reset to first page when search changes
    }, 1000),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    const keyword = searchParams.get('keyword') ?? '';
    const categoryId = searchParams.get('categoryId') ?? 'all';
    const pageParam = searchParams.get('page');
    const pageNumber = pageParam ? parseInt(pageParam, 10) : 1;
    const page = Math.max(0, pageNumber - 1);

    setSearchTerm(keyword);
    setActualSearchTerm(keyword);
    setSelectedCategory(categoryId);
    setCurrentPage(page);
    setIsInitialized(true);
  }, [searchParams]);

  const updateURL = (keyword: string, categoryId: string, page: number) => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (categoryId !== 'all') params.set('categoryId', categoryId);
    if (page > 0) params.set('page', String(page + 1));

    const newURL = params.toString() ? `/practice-tests?${params.toString()}` : '/practice-tests';
    router.push(newURL);
  };

  const fetchData = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await getAllExamsForClient({
        page: currentPage,
        size: 6,
        keyword: actualSearchTerm || undefined,
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
    const loadCategories = async () => {
      try {
        await fetchCategories();
      } catch (error) {
        toast.error('Đã xảy ra lỗi khi tải danh mục!');
      }
    };

    if (categories.length === 0) {
      loadCategories();
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      fetchData();
    }
  }, [currentPage, actualSearchTerm, selectedCategory, isInitialized]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debouncedSearch(value); // Use debounced search to avoid too many API calls
  };

  // Update URL when actual search term changes
  useEffect(() => {
    if (isInitialized) {
      updateURL(actualSearchTerm, selectedCategory, currentPage);
    }
  }, [actualSearchTerm, selectedCategory, currentPage, isInitialized]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!isInitialized) {
    return <PracticeTestsLoading />;
  }

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
                placeholder="Tìm đề theo tên, mô tả, danh mục đề thi..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm !== actualSearchTerm && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-blue-600" />
              )}
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
                <SelectTrigger className="w-60">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.categoryId}
                      value={category.categoryId.toString()}
                    >
                      {category.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>


        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Đang tải đề thi...</span>
          </div>
        )}


        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practiceTests.map((test) => (
              <Card key={test.examId} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="bg-green-100 text-blue-600 mb-2">
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
                      {/* <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        120 phút
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        lượt làm
                      </span> */}
                    </div>
                    <div className="flex justify-between">
                      <span>{test.totalQuestions} câu hỏi</span>
                      <span>{test.totalParts} phần thi</span>
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
        )}


        {!loading && practiceTests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Không tìm thấy đề phù hợp với tiêu chí của bạn.</p>
            {(selectedCategory !== 'all' || actualSearchTerm) && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setActualSearchTerm('');
                  setSelectedCategory('all');
                  setCurrentPage(0);
                  debouncedSearch.cancel();
                }}
              >
                Xem tất cả đề thi
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
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

export default PracticeTestsList;
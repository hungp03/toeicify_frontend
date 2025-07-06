'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, User, Clock, Search, TrendingUp } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: '10 mẹo luyện nghe TOEIC hiệu quả',
    excerpt: 'Nắm bắt các chiến lược đã giúp hàng ngàn học viên cải thiện điểm phần Listening TOEIC.',
    author: 'Sarah Johnson',
    date: '2024-01-15',
    readTime: '5 phút',
    category: 'Listening',
    image: '/placeholder.svg',
    featured: true,
  },
  {
    id: 2,
    title: 'Các lỗi ngữ pháp thường gặp trong TOEIC Reading',
    excerpt: 'Tránh những lỗi ngữ pháp phổ biến có thể làm bạn mất điểm trong phần đọc hiểu.',
    author: 'David Chen',
    date: '2024-01-12',
    readTime: '7 phút',
    category: 'Reading',
    image: '/placeholder.svg',
    featured: false,
  },
  {
    id: 3,
    title: '10 Essential TOEIC Listening Tips for Success',
    excerpt: 'Master the listening section with these proven strategies that helped thousands of students improve their scores.',
    author: 'Sarah Johnson',
    date: '2024-01-15',
    readTime: '5 min read',
    category: 'Listening',
    image: '/placeholder.svg',
    featured: true,
  },
  {
    id: 4,
    title: 'Common Grammar Mistakes in TOEIC Reading',
    excerpt: 'Avoid these frequent grammar errors that could cost you points in the reading comprehension section.',
    author: 'David Chen',
    date: '2024-01-12',
    readTime: '7 min read',
    category: 'Reading',
    image: '/placeholder.svg',
    featured: false,
  },
  {
    id: 5,
    title: 'How to Score 900+ on TOEIC: A Complete Guide',
    excerpt: 'Learn the strategies and study methods that top scorers use to achieve excellent results.',
    author: 'Maria Garcia',
    date: '2024-01-10',
    readTime: '12 min read',
    category: 'Strategy',
    image: '/placeholder.svg',
    featured: true,
  },
  {
    id: 6,
    title: 'Business Vocabulary for TOEIC Success',
    excerpt: 'Essential business terms and phrases that frequently appear in TOEIC tests.',
    author: 'James Wilson',
    date: '2024-01-08',
    readTime: '6 min read',
    category: 'Vocabulary',
    image: '/placeholder.svg',
    featured: false,
  },
  {
    id: 7,
    title: 'TOEIC Speaking Test: Preparation Strategies',
    excerpt: 'Comprehensive guide to preparing for the TOEIC Speaking test with practical exercises.',
    author: 'Emily Rodriguez',
    date: '2024-01-05',
    readTime: '9 min read',
    category: 'Speaking',
    image: '/placeholder.svg',
    featured: false,
  },
  {
    id: 8,
    title: 'Time Management Techniques for TOEIC',
    excerpt: 'Learn how to effectively manage your time during the test to maximize your score.',
    author: 'Michael Kim',
    date: '2024-01-03',
    readTime: '4 min read',
    category: 'Strategy',
    image: '/placeholder.svg',
    featured: false,
  },
];

const categories = ['Tất cả', 'Listening', 'Reading', 'Speaking', 'Writing', 'Vocabulary', 'Strategy'];

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Listening: 'bg-blue-100 text-blue-800',
    Reading: 'bg-green-100 text-green-800',
    Speaking: 'bg-purple-100 text-purple-800',
    Writing: 'bg-yellow-100 text-yellow-800',
    Vocabulary: 'bg-red-100 text-red-800',
    Strategy: 'bg-gray-100 text-gray-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

export default function BlogPage() {
  const featuredPosts = blogPosts.filter(p => p.featured);
  const regularPosts = blogPosts.filter(p => !p.featured);
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề trang */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog luyện thi TOEIC</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Mẹo học, chiến lược và phân tích giúp bạn chinh phục TOEIC với điểm số mong muốn.
          </p>
        </div>

        {/* Tìm kiếm & lọc */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Tìm bài viết..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button key={category} variant="outline" size="sm" className="hover:bg-blue-50">
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Bài viết nổi bật */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Bài viết nổi bật</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredPosts.map(post => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200"></div>
                <CardHeader>
                  <div className="flex justify-between mb-2">
                    <Badge className={getCategoryColor(post.category)}>{post.category}</Badge>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Nổi bật</Badge>
                  </div>
                  <CardTitle className="text-xl hover:text-blue-600">
                    <Link href={`/blog/${post.id}`}>{post.title}</Link>
                  </CardTitle>
                  <CardDescription>{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-gray-500">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" /> {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> {new Date(post.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {post.readTime}
                    </div>
                  </div>
                  <Link href={`/blog/${post.id}`}>
                    <Button className="w-full mt-4 bg-blue-600 text-white hover:bg-blue-500">Đọc thêm</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Bài viết khác */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Bài viết mới nhất</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map(post => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <div className="h-40 bg-gray-200"></div>
                <CardHeader>
                  <Badge className={`${getCategoryColor(post.category)} w-fit`}>{post.category}</Badge>
                  <CardTitle className="text-lg hover:text-blue-600">
                    <Link href={`/blog/${post.id}`}>{post.title}</Link>
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {post.readTime}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {new Date(post.date).toLocaleDateString()}
                    </div>
                  </div>
                  <Link href={`/blog/${post.id}`}>
                    <Button variant="outline" className="w-full mt-4">Đọc bài viết</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Đăng ký nhận bản tin */}
        <section className="mt-16 bg-blue-600 rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Nhận tin mới nhất</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Các mẹo TOEIC, tài liệu luyện tập và câu chuyện thành công sẽ được gửi đến bạn!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input type="email" placeholder="Nhập email của bạn" className="bg-white text-gray-900" />
            <Button className="bg-green-600 hover:bg-green-700">Đăng ký</Button>
          </div>
        </section>
      </div>
    </div>
  );
}

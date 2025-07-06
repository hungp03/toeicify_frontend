import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, Clock, ArrowLeft, Share2, BookOpen } from 'lucide-react';

type Props = {
  params: {
    id: string;
  };
};

const getCategoryColor = (category: string) => {
  const colors = {
    Listening: 'bg-blue-100 text-blue-800',
    Reading: 'bg-green-100 text-green-800',
    Strategy: 'bg-gray-100 text-gray-800',
    Vocabulary: 'bg-red-100 text-red-800',
  };
  return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const mockData = {
  id: '1',
  title: '10 Essential TOEIC Listening Tips for Success',
  author: 'Sarah Johnson',
  date: '2024-01-15',
  readTime: '5 min read',
  category: 'Listening',
  tags: ['TOEIC', 'Listening', 'Tips', 'Study Guide'],
  content: `
    <div class="prose max-w-none">
      <p>The TOEIC Listening section can be challenging...</p>
      <h2 id="section1">1. Familiarize Yourself with the Test Format</h2>
      <ul><li>Part 1: Photographs (6 questions)</li></ul>
      <h2 id="section2">2. Practice Active Listening</h2>
      <p>Active listening involves...</p>
    </div>
  `,
};

const relatedPosts = [
  { id: 2, title: 'Common Grammar Mistakes in TOEIC Reading', category: 'Reading', readTime: '7 min read' },
  { id: 3, title: 'How to Score 900+ on TOEIC: A Complete Guide', category: 'Strategy', readTime: '12 min read' },
  { id: 4, title: 'Business Vocabulary for TOEIC Success', category: 'Vocabulary', readTime: '6 min read' },
];

export default function BlogPostPage({ params }: Props) {
  const { id } = params;

  // Giả lập lấy bài viết theo ID
  if (id !== mockData.id) return notFound();
  const post = mockData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

          {/* Quay lại blog */}
          <Link href="/blog">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại blog
            </Button>
          </Link>

          {/* Header bài viết */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="h-64 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <Badge className={getCategoryColor(post.category)}>{post.category}</Badge>
                {post.tags.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
              <div className="flex justify-between text-gray-600">
                <div className="flex gap-6 flex-wrap">
                  <div className="flex items-center gap-2"><User className="h-4 w-4" /> {post.author}</div>
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {new Date(post.date).toLocaleDateString()}</div>
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {post.readTime}</div>
                </div>
                <Button variant="outline" size="sm"><Share2 className="h-4 w-4 mr-2" />Chia sẻ</Button>
              </div>
            </div>
          </div>

          {/* Nội dung và Sidebar */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Nội dung bài viết */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-8">
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Mục lục */}
              <Card>
                <CardHeader><CardTitle className="text-lg">Mục lục</CardTitle></CardHeader>
                <CardContent>
                  <nav className="space-y-2 text-sm">
                    <a href="#section1" className="block text-blue-600 hover:underline">1. Familiarize Yourself...</a>
                    <a href="#section2" className="block text-blue-600 hover:underline">2. Practice Active Listening</a>
                  </nav>
                </CardContent>
              </Card>

              {/* Bài viết liên quan */}
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BookOpen className="h-5 w-5" /> Bài liên quan</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {relatedPosts.map(post => (
                    <div key={post.id} className="border-b pb-4 last:border-none">
                      <Link href={`/blog/${post.id}`} className="block hover:text-blue-600">
                        <h4 className="font-medium mb-2">{post.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Badge className={getCategoryColor(post.category)}>{post.category}</Badge>
                          <span>{post.readTime}</span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* CTA */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader><CardTitle className="text-lg text-blue-900">Sẵn sàng luyện tập?</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-blue-800 mb-4">Áp dụng ngay các mẹo bằng bài luyện tập thực tế.</p>
                  <Link href="/practice-tests">
                    <Button className="w-full">Bắt đầu làm bài</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

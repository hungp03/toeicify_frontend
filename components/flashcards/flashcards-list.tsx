'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Book, BookPlus, FlipHorizontal, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth';
import {
  getFlashcardLists,
  createFlashcardList,
  markListInProgress,
  searchFlashcardLists
} from '@/lib/api/flashcard';
import { FlashcardList } from '@/types/flashcard';
import FullPageLoader from '@/components/common/full-page-loader';
import { createFlashcardListSchema, CreateFlashcardListFormData } from '@/lib/schema'; 


export function FlashcardsListContent() {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardList[]>([]);
  const [newSetTitle, setNewSetTitle] = useState('');
  const [newSetDescription, setNewSetDescription] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [tab, setTab] = useState<'mine' | 'learning' | 'explore'>('mine');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const router = useRouter();

  const fetchLists = async () => {
    try {
      const res = await getFlashcardLists(tab, 1);
      setFlashcardSets(res.result);
    } catch (e) {
      toast.error('Không thể tải danh sách flashcard. Vui lòng thử lại sau.');
    }
  };

  const handleSearch = async () => {
    if (tab === 'explore' && searchKeyword.trim()) {
      try {
        const res = await searchFlashcardLists(searchKeyword.trim(), 1);
        setFlashcardSets(res.result);
      } catch (e) {
        toast.error('Không thể tìm kiếm.');
      }
    }
  };

  const handleCreateSet = async () => {

    const validation = createFlashcardListSchema.safeParse({
      listName: newSetTitle,
      description: newSetDescription,
    });

    // Trong handleCreateSet
    if (!validation.success) {
      const fieldErrors: { title?: string; description?: string } = {};
      validation.error.errors.forEach((e) => {
        if (e.path[0] === 'listName') fieldErrors.title = e.message;
        if (e.path[0] === 'description') fieldErrors.description = e.message;
      });
      setErrors(fieldErrors);
      return;
    } else {
      setErrors({});
    }

    try {
      const payload: CreateFlashcardListFormData = validation.data;
      await createFlashcardList(payload);
      setIsCreateDialogOpen(false);
      setNewSetTitle('');
      setNewSetDescription('');
      fetchLists();
      toast.success('Tạo bộ thẻ thành công!');
    } catch (e) {
      toast.error('Không thể tạo bộ thẻ. Vui lòng thử lại sau.');
    }
  };

  const handleStartStudy = async (id: number) => {
    try {
      await markListInProgress(`${id}`);
      router.push(`/flashcards/${id}/study`);
    } catch (e) {
      toast.error('Không thể bắt đầu ôn tập. Vui lòng thử lại sau.');
    }
  };

  useEffect(() => {
    if (hasHydrated && user) {
      fetchLists();
    }
  }, [hasHydrated, user, tab]);

  if (!hasHydrated) return <FullPageLoader />;

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Flashcards</h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            Tạo và học bộ thẻ ghi nhớ để cải thiện vốn từ vựng của bạn.
          </p>
        </div>

        {user ? (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 sm:gap-6 mb-6">
              {/* Tab buttons */}
              <div className="flex gap-2 sm:gap-3 overflow-x-auto">
                <Button  
                  variant={tab === 'mine' ? 'default' : 'outline'}
                  onClick={() => setTab('mine')}
                  className="whitespace-nowrap text-sm sm:text-base"
                >
                  Danh sách của tôi
                </Button>
                <Button 
                  variant={tab === 'learning' ? 'default' : 'outline'}
                  onClick={() => setTab('learning')}
                  className="whitespace-nowrap text-sm sm:text-base"
                >
                  Đang học
                </Button>
                <Button 
                  variant={tab === 'explore' ? 'default' : 'outline'}
                  onClick={() => setTab('explore')}
                  className="whitespace-nowrap text-sm sm:text-base"
                >
                  Khám phá
                </Button>
              </div>

              {/* Create button for mine tab */}
              {tab === 'mine' && (
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-500 w-full sm:w-auto">
                      <BookPlus className="h-4 w-4 mr-2" />
                      <span className="sm:inline">Tạo bộ thẻ mới</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="mx-4 max-w-md sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Tạo bộ thẻ mới</DialogTitle>
                      <DialogDescription>
                        Tạo một bộ thẻ ghi nhớ mới để tổ chức việc học từ vựng của bạn.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title" className='mb-2'>Tiêu đề</Label>
                        <Input
                          id="title"
                          placeholder="Nhập tiêu đề bộ thẻ"
                          value={newSetTitle}
                          onChange={(e) => setNewSetTitle(e.target.value)}
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                      </div>
                      <div>
                        <Label htmlFor="description" className='mb-2'>Mô tả (tùy chọn)</Label>
                        <Textarea
                          id="description"
                          placeholder="Nhập mô tả"
                          value={newSetDescription}
                          onChange={(e) => setNewSetDescription(e.target.value)}
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                      </div>
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsCreateDialogOpen(false)}
                          className="order-2 sm:order-1"
                        >
                          Hủy
                        </Button>
                        <Button
                          className="bg-blue-600 hover:bg-blue-500 order-1 sm:order-2"
                          onClick={handleCreateSet}
                          disabled={!newSetTitle.trim()}
                        >
                          Tạo bộ thẻ
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Search for explore tab */}
            {tab === 'explore' && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center mb-6 gap-2">
                <Input
                  placeholder="Tìm kiếm flashcard theo tên..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button 
                  onClick={handleSearch} 
                  className="bg-blue-600 hover:bg-blue-500 flex items-center justify-center w-full sm:w-auto"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Tìm kiếm
                </Button>
              </div>
            )}

            {/* Flashcard grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {flashcardSets.map((set) => (
                <Card key={set.listId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Book className="h-5 w-5" />
                      {set.listName}
                    </CardTitle>
                    <CardDescription className="h-5 line-clamp-2">
                      {set.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600">
                        <p>{set.cardCount} thẻ</p>
                        <p>Tạo vào {new Date(set.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <Link href={`/flashcards/${set.listId}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <Book className="h-4 w-4 mr-2" />
                            Quản lý
                          </Button>
                        </Link>
                        <Button
                          className="bg-blue-600 hover:bg-blue-500 flex-1"
                          onClick={() => handleStartStudy(set.listId)}
                        >
                          <FlipHorizontal className="h-4 w-4 mr-2" />
                          Học
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty state */}
            {flashcardSets.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-500 text-base sm:text-lg mb-4">Không có bộ thẻ nào trong mục này.</p>
                {tab === 'mine' && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <BookPlus className="h-4 w-4 mr-2" />
                    Tạo flashcard đầu tiên của bạn
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 text-base sm:text-lg mt-8 sm:mt-12 px-4">
            Vui lòng{' '}
            <Link href="/login" className="text-blue-600 underline">
              đăng nhập
            </Link>{' '}
            để sử dụng tính năng flashcards.
          </div>
        )}
      </div>
    </div>
  );
}

export function FlashcardsListLoading() {
  return <FullPageLoader />;
}
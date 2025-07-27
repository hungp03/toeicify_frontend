'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Book, Eye, Loader } from 'lucide-react';
import { getFlashcardLists, createFlashcardList, markListInProgress } from '@/lib/api/flashcard';
import { FlashcardList, PaginationResponse } from '@/types/flashcard';
import { useRouter } from 'next/navigation';


export default function FlashcardsPage() {
  const [tab, setTab] = useState<'mine' | 'learning' | 'explore'>('mine');
  const [lists, setLists] = useState<FlashcardList[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ listName: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const router = useRouter();
  

  const fetchLists = async (page = 1) => {
    try {
      setIsLoading(true); // Bắt đầu loading
      const res: PaginationResponse<FlashcardList> = await getFlashcardLists(tab, page);
      setLists(res.result);
      setCurrentPage(res.meta.page);
      setTotalPages(res.meta.pages);
    } catch (e) {
      console.error('Tải danh sách thất bại:', e);
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };
  

  const handleCreate = async () => {
    try {
      await createFlashcardList(formData);
      setIsCreateOpen(false);
      setFormData({ listName: '', description: '' });
      fetchLists(1);
    } catch (e) {
      console.error('Tạo thất bại:', e);
    }
  };
  const startLearning = async (id = 0) => {
      await markListInProgress(`${id}` as string);
      router.push(`/flashcards/${id}/study`);
    };

  useEffect(() => {
    if (hasHydrated && user) {
      fetchLists(1);
    }
  }, [tab, hasHydrated, user]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => fetchLists(i)}
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex justify-center gap-2 mt-8">
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => fetchLists(currentPage - 1)}
        >
          &larr;
        </Button>
        {pages}
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => fetchLists(currentPage + 1)}
        >
          &rarr;
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-white">
      <h1 className="text-4xl font-bold mb-6 flex items-center gap-2">
        <Book className="h-6 w-6" /> Flashcards
      </h1>

      <div className="flex gap-3 mb-8">
        <Button variant={tab === 'mine' ? 'default' : 'outline'} onClick={() => setTab('mine')}>Danh sách của tôi</Button>
        <Button variant={tab === 'learning' ? 'default' : 'outline'} onClick={() => setTab('learning')}>Đang học</Button>
        <Button variant={tab === 'explore' ? 'default' : 'outline'} onClick={() => setTab('explore')}>Khám phá</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {tab === 'mine' && user && (
          <Card
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center h-full w-full cursor-pointer border border-dashed border-blue-400 hover:bg-blue-50 transition-all shadow-sm"
          >
            <CardContent className="p-0 m-0 text-blue-600 font-medium text-sm flex items-center justify-center h-[160px]">
              <span className="inline-flex items-center gap-1">
                <span className="text-lg">+</span> Tạo list từ
              </span>
            </CardContent>
          </Card>
        )}

        {lists.map((list, index) => (
          <Card key={`${list.listId}-${index}`} className="hover:shadow-md h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle>{list.listName}</CardTitle>
              <CardDescription>{list.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2 flex flex-col justify-between flex-1">
              {tab === 'explore' && (
                <p>
                  <Eye className="inline h-4 w-4 mr-1" /> Tác giả: {list.ownerName}
                </p>
              )}
              <div className="flex justify-between text-sm text-gray-500">
                <p>{list.cardCount} thẻ</p>
                <p className="ml-auto">Ngày tạo: {new Date(list.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
              <div className="flex justify-between gap-3 pt-4">
                <Link href={`/flashcards/${list.listId}`} className="w-28">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full px-4 shadow-sm hover:border-blue-500"
                  >
                    Quản lý
                  </Button>
                </Link>
                
                  <Button onClick={()=>startLearning(list?.listId)} variant="outline" 
                  className="w-28 bg-blue-600 text-white px-4 hover:bg-blue-700 hover:text-white shadow">
                    Ôn tập
                  </Button>
                
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {renderPagination()}

      {user && isLoading && (
        <div className="flex justify-center py-12">
          <Loader className="h-6 w-6 text-gray-500 animate-spin" />
        </div>
      )}

      {user && lists.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">
          Không có danh sách nào trong mục này.
        </div>
      )}

      {!user && (
        <div className="text-center text-gray-500 text-sm mt-8">
          Vui lòng <Link href="/login" className="text-blue-600 underline">đăng nhập</Link> để sử dụng danh sách flashcard và tạo list từ.
        </div>
      )}

      {/* Dialog tạo mới */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo list từ</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <label className="block mb-1 text-sm font-medium">Tiêu đề*</label>
              <Input
                value={formData.listName}
                onChange={(e) => setFormData({ ...formData, listName: e.target.value })}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Mô tả</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button onClick={handleCreate}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

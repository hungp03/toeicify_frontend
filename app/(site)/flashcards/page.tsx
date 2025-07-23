'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Book, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getFlashcardLists, createFlashcardList } from '@/lib/api/flashcard';

type FlashcardList = {
  listId: number;
  listName: string;
  description?: string;
  cardCount: number;
  createdAt: string;
  isPublic: boolean;
  ownerName?: string;
};

export default function FlashcardsPage() {
  const [tab, setTab] = useState<'mine' | 'learning' | 'explore'>('mine');
  const [lists, setLists] = useState<FlashcardList[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({ listName: '', description: '' });
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const handleCreate = async () => {
    try {
      await createFlashcardList(formData);
      setIsCreateOpen(false);
      setFormData({ listName: '', description: '' });
      getFlashcardLists(tab).then(setLists);
    } catch (e) {
      console.error('Tạo thất bại:', e);
    }
  };

  useEffect(() => {
    if (hasHydrated && user) {
      getFlashcardLists(tab).then(setLists);
    }
  }, [tab, hasHydrated]);

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
              <Link href={`/flashcards/${list.listId}/study`} className="w-28">
                <Button
                  size="sm"
                  className="w-full bg-blue-600 text-white px-4 hover:bg-blue-700 shadow"
                >
                  Ôn tập
                </Button>
              </Link>
            </div>

          </CardContent>
        </Card>
      ))}
    </div>



      {lists.length === 0 && user &&  (
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
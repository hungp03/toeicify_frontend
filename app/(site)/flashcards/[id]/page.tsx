'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { getFlashcardListDetail, createFlashcard, updateFlashcard, 
  deleteFlashcard, toggleFlashcardListPublic } from '@/lib/api/flashcard';
import { Edit2, Trash2, Shuffle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Lock, Globe2 } from "lucide-react";
import { useRouter } from 'next/navigation';



interface FlashcardDetail {
  cardId: number;
  frontText: string;
  backText: string;
  category?: string;
}

interface ListDetailResponse {
  listName: string;
  flashcards: FlashcardDetail[];
  totalCards: number;
  learnedCards: number;
  rememberedCards: number;
  needReviewCards: number;
  isPublic: boolean;
  isOwner: boolean;
}

export default function FlashcardListPage() {
  const { id } = useParams();
  const [list, setList] = useState<ListDetailResponse | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    frontText: '',
    backText: '',
    category: '',
  });  
  const [editingCard, setEditingCard] = useState<FlashcardDetail | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const router = useRouter();
  
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const handleAddFlashcard = async () => {
    try {
      await createFlashcard(id as string, formData);
      setIsAddOpen(false);
      setFormData({ frontText: '', backText: '', category: ''});
      getFlashcardListDetail(id as string).then(setList); // Load lại danh sách
    } catch (e) {
      console.error('Lỗi khi thêm flashcard:', e);
    }
  };
  const handleUpdateFlashcard = async () => {
    if (!editingCard || !id) return;
  
    await updateFlashcard(
      parseInt(id as string),
      editingCard.cardId,
      {
        frontText: editingCard.frontText,
        backText: editingCard.backText,
        category: editingCard.category,
      }
    );
  
    setIsEditOpen(false);
    getFlashcardListDetail(id as string).then(setList);
  };  
  const handleDeleteFlashcard = async (cardId: number) => {
    if (!id) return;
    try {
      await deleteFlashcard(id as string, cardId);
      getFlashcardListDetail(id as string).then(setList); // Cập nhật lại danh sách + thống kê
    } catch (e) {
      console.error('Lỗi khi xóa flashcard:', e);
    }
  };
  const handleTogglePublic = async () => {
    if (!id) return;
    try {
      const res = await toggleFlashcardListPublic(id as string);
      setList(prev => prev ? { ...prev, isPublic: res.isPublic } : prev);
    } catch (err) {
      console.error('Lỗi khi toggle trạng thái:', err);
    }
  };

  useEffect(() => {
    if (id && hasHydrated && user) {
      getFlashcardListDetail(id as string).then(setList);
    }
  }, [id, hasHydrated]);

  if (!list) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Flashcards: {list.listName}
        </h1>
        <div className="flex gap-2">
        <Button 
          onClick={() => router.push(`/flashcards/${id}/edit`)} 
          className="bg-blue-700 text-white hover:bg-blue-800 text-sm px-3 py-1 rounded"
        >
          Chỉnh sửa
        </Button>
          <Button 
            onClick={() => setIsAddOpen(true)}
            className="bg-blue-700 text-white hover:bg-blue-800 text-sm px-3 py-1 rounded">
            Thêm từ mới
          </Button>
          {list.isOwner && (
            <Button
            onClick={handleTogglePublic}
            className={`text-sm px-3 py-1 rounded flex items-center gap-1 
              ${list.isPublic ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'} 
              text-white`}
          >
            {list.isPublic ? <Globe2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {list.isPublic ? 'Public' : 'Private'}
          </Button>
          )}
        </div>
      </div>

      <Button 
        onClick={()=>router.push(`/flashcards/${id}/study`)}
        variant="outline" className="w-full mb-6">Luyện tập flashcards</Button>

      {/* <div className="flex items-center text-sm text-blue-600 mb-2 cursor-pointer hover:underline">
        <Shuffle className="h-4 w-4 mr-1" /> Xem ngẫu nhiên
      </div> */}

      {list.flashcards.length > 0 && (
        <div className="bg-white rounded shadow p-4 mb-8">
          <div className="flex justify-between text-center">
            <div>
              <p className="text-xl font-bold">{list.totalCards}</p>
              <p className="text-gray-500">Tổng số từ</p>
            </div>
            <div>
              <p className="text-xl font-bold">{list.learnedCards}</p>
              <p className="text-gray-500">Đã học</p>
            </div>
            <div>
              <p className="text-xl font-bold">{list.rememberedCards}</p>
              <p className="text-gray-500">Đã nhớ</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-500">{list.needReviewCards}</p>
              <p className="text-gray-500">Cần ôn tập</p>
            </div>
          </div>

          <div className="h-4 bg-gray-200 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-green-500 h-full"
              style={{ width: `${(list.learnedCards / list.totalCards) * 100 || 0}%` }}
            />
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-2">List có {list.flashcards.length} từ</h2>

      <div className="space-y-4">
        {list.flashcards.map((card) => (
          <div key={card.cardId} className="flex bg-white rounded shadow p-4 gap-4">
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <p className="font-semibold text-lg mr-2">
                  {card.frontText} ({card.category})
                </p>
                <Edit2
                  onClick={() => {
                    setEditingCard(card);
                    setIsEditOpen(true);
                  }}
                  className="h-4 w-4 text-gray-500 cursor-pointer" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Định nghĩa:<br /> {card.backText}</p>
            </div>            
            <Trash2 
              onClick={() => handleDeleteFlashcard(card.cardId)}
              className="h-5 w-5 text-red-500 cursor-pointer self-end" />
          </div>
        ))}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo flashcard</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Từ mới</label>
              <Input
                value={formData.frontText}
                onChange={(e) => setFormData({ ...formData, frontText: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Định nghĩa</label>
              <Textarea
                value={formData.backText}
                onChange={(e) => setFormData({ ...formData, backText: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Loại từ</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">-- Chọn loại từ --</option>
                <option value="noun">noun (danh từ)</option>
                <option value="verb">verb (động từ)</option>
                <option value="adjective">adjective (tính từ)</option>
                <option value="adverb">adverb (trạng từ)</option>
                <option value="preposition">preposition (giới từ)</option>
                <option value="conjunction">conjunction (liên từ)</option>
                <option value="interjection">interjection (thán từ)</option>
                <option value="pronoun">pronoun (đại từ)</option>
                <option value="article">article (mạo từ)</option>
              </select>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button onClick={handleAddFlashcard}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa flashcard</DialogTitle>
          </DialogHeader>

          {editingCard && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Từ mới</label>
                <Input
                  value={editingCard.frontText}
                  onChange={(e) =>
                    setEditingCard({ ...editingCard, frontText: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Định nghĩa</label>
                <Textarea
                  value={editingCard.backText}
                  onChange={(e) =>
                    setEditingCard({ ...editingCard, backText: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Loại từ</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={editingCard.category}
                  onChange={(e) =>
                    setEditingCard({ ...editingCard, category: e.target.value })
                  }
                >
                  <option value="">-- Chọn loại từ --</option>
                  <option value="noun">noun (danh từ)</option>
                  <option value="verb">verb (động từ)</option>
                  <option value="adjective">adjective (tính từ)</option>
                  <option value="adverb">adverb (trạng từ)</option>
                  <option value="preposition">preposition (giới từ)</option>
                  <option value="conjunction">conjunction (liên từ)</option>
                  <option value="interjection">interjection (thán từ)</option>
                  <option value="pronoun">pronoun (đại từ)</option>
                  <option value="article">article (mạo từ)</option>
                </select>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button onClick={handleUpdateFlashcard}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

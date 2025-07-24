'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { getFlashcardListDetail, createFlashcard, updateFlashcard, 
  deleteFlashcard, toggleFlashcardListPublic, 
  getPaginatedFlashcards, markListInProgress, stopLearningFlashcardList } from '@/lib/api/flashcard';
import { PaginationResponse, ListDetailResponse, FlashcardDetail } from '@/types/flashcard';
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
  const [flashcards, setFlashcards] = useState<FlashcardDetail[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const handleAddFlashcard = async () => {
    try {
      await createFlashcard(id as string, formData);
      setIsAddOpen(false);
      setFormData({ frontText: '', backText: '', category: ''});
      getFlashcardListDetail(id as string).then(setList); // Load lại danh sách
      fetchFlashcards(currentPage);
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
    fetchFlashcards(currentPage);
  };  
  const handleDeleteFlashcard = async (cardId: number) => {
    if (!id) return;
    try {
      await deleteFlashcard(id as string, cardId);
  
      // Gọi lại để cập nhật thống kê tổng flashcards
      const updatedList = await getFlashcardListDetail(id as string);
      setList(updatedList);
  
      // Tính lại totalPages mới
      const newTotalPages = Math.ceil(updatedList.totalCards / 10);
  
      // Nếu page hiện tại > số trang mới thì lùi về trang cuối cùng
      const newPage = currentPage > newTotalPages ? newTotalPages : currentPage;
  
      setCurrentPage(newPage);
      fetchFlashcards(newPage); // Gọi lại API phân trang
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
  const fetchFlashcards = async (page = 1) => {
    try {
      const res: PaginationResponse<FlashcardDetail> = await getPaginatedFlashcards(id as string, page);
      setFlashcards(res.result);
      setCurrentPage(res.meta.page);
      setTotalPages(res.meta.pages);
    } catch (error) {
      console.error('Lỗi khi tải flashcards:', error);
    }
  };
  const startLearning = async () => {
    await markListInProgress(id as string);
    router.push(`/flashcards/${id}/study`);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => fetchFlashcards(i)}
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
          onClick={() => fetchFlashcards(currentPage - 1)}
        >
          &larr;
        </Button>
        {pages}
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => fetchFlashcards(currentPage + 1)}
        >
          &rarr;
        </Button>
      </div>
    );
  };

  useEffect(() => {
    if (id && hasHydrated && user) {
      getFlashcardListDetail(id as string).then(setList);
      fetchFlashcards(1);
    }
  }, [id, hasHydrated]);

  if (!list) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Flashcards: {list.listName}
        </h1>
        {list.isOwner && (
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
            <Button
              onClick={handleTogglePublic}
              className={`text-sm px-3 py-1 rounded flex items-center gap-1 
                ${list.isPublic ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'} 
                text-white`}
            >
              {list.isPublic ? <Globe2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {list.isPublic ? 'Public' : 'Private'}
            </Button>
          </div>
          )}
      </div>

      

      {list.flashcards.length > 0 && (
        <div>
          <Button onClick={startLearning} variant="outline" className="w-full mb-6">
            Luyện tập flashcards
          </Button>


          {list.inProgress && (
            <Button
              variant="destructive"
              className="w-full mb-4 bg-transparent text-red-500 hover:underline 
              hover:bg-transparent hover:text-red-500 cursor-pointer border-0 shadow-transparent mr-40 pl-0 justify-end"
              onClick={async () => {
                try {
                  await stopLearningFlashcardList(id as string);
                  router.push(`/flashcards/`);
                } catch (err) {
                  console.error("Lỗi khi dừng học:", err);
                }
              }}
            >
              ❌ Dừng học list này
            </Button>
          )}
        
        </div>
      )}

      <h2 className="text-lg font-semibold mb-2">List có {list.flashcards.length} từ</h2>

      <div className="space-y-4">
        {flashcards.map((card) => (
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

      {renderPagination()}

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

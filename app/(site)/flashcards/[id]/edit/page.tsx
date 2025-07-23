'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useAuthStore } from '@/store/auth';
import { Trash2 } from 'lucide-react';
import { updateFlashcardList } from '@/lib/api/flashcard';
import { toast } from 'sonner';

interface FlashcardDetail {
  cardId: number;
  frontText: string;
  backText: string;
  category?: string;
}

interface ListDetailResponse {
  listName: string;
  description?: string;
  flashcards: FlashcardDetail[];
  totalCards: number;
  learnedCards: number;
  rememberedCards: number;
  needReviewCards: number;
  isPublic: boolean;
  isOwner: boolean;
}

export default function FlashcardListEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [flashcards, setFlashcards] = useState<FlashcardDetail[]>([]);

  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsSticky(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!id || !hasHydrated || !user) return;

    const fetchList = async () => {
      try {
        const token = useAuthStore.getState().accessToken;
        const res = await axios.get<ListDetailResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/flashcards/list/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        const data = res.data?.data;
        setTitle(data.listName || '');
        setDescription(data.description || '');
        setFlashcards(data.flashcards || []);
      } catch (err) {
        console.error('Error loading flashcard list:', err);
      }
    };

    fetchList();
  }, [id, hasHydrated, user]);

  const handleSave = async () => {
    try {
        const res = await updateFlashcardList(id as string, {
          listName: title,
          description,
          flashcards,
        });
    
        // Nếu API có trả về success thì kiểm tra:
        if (res?.success !== false) {
          toast.success('Lưu thành công!');
          router.push(`/flashcards/${id}`);
        } else {
          toast.error('Lưu thất bại, vui lòng thử lại!');
        }
      } catch (error) {
        toast.error('Đã xảy ra lỗi, vui lòng thử lại sau!');
      }
    };

  const handleAddCard = () => {
    const maxId = flashcards.reduce((max, card) => Math.max(max, card.cardId), 0);
    setFlashcards([
      ...flashcards,
      {
        cardId: maxId + 1,
        frontText: '',
        backText: '',
      },
    ]);
  };

  return (
    <div className="relative">
      <div className={`sticky top-[64px] z-40 pt-4 px-4 py-3 transition-colors duration-300 
        ${isSticky ? 'bg-white shadow-sm border-b' : 'bg-transparent'}`}>
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button variant="outline" onClick={() => router.push(`/flashcards/${id}`)}>
            Trở về
          </Button>
          <Button onClick={handleSave} className="bg-blue-700 text-white">
            Lưu
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-20 pt-6">
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 mb-1">Tên</p>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold mb-3"
          />
          <p className="text-sm font-medium text-gray-600 mb-1">Mô tả</p>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả"
          />
        </div>

        <div className="space-y-6">
          {flashcards.map((card, index) => (
            <div key={`${card.cardId}-${index}`} className="bg-white p-4 rounded border relative">
              <p className="text-sm text-gray-400 mb-2 font-semibold">{index + 1}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase">Từ</p>
                  <Input
                    value={card.frontText}
                    onChange={(e) => {
                      const updated = [...flashcards];
                      updated[index].frontText = e.target.value;
                      setFlashcards(updated);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Loại từ</label>
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={card.category || ''}
                    onChange={(e) => {
                      const updated = [...flashcards];
                      updated[index].category = e.target.value;
                      setFlashcards(updated);
                    }}
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

              <div className="mt-4">
              <p className="text-xs text-gray-500 mb-1 uppercase">Định nghĩa</p>
                  <Input
                    value={card.backText}
                    onChange={(e) => {
                      const updated = [...flashcards];
                      updated[index].backText = e.target.value;
                      setFlashcards(updated);
                    }}
                  />
              </div>

              <Trash2
                onClick={() => {
                  const updated = flashcards.filter((_, i) => i !== index);
                  setFlashcards(updated);
                }}
                className="absolute top-4 right-4 h-5 w-5 text-red-500 cursor-pointer"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <Button variant="outline" onClick={handleAddCard}>
            Thêm từ
          </Button>
        </div>
      </div>
    </div>
  );
}

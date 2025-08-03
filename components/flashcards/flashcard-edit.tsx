'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { Trash2, Loader } from 'lucide-react';
import { updateFlashcardList, getFlashcardListDetail } from '@/lib/api/flashcard';
import { ListDetailResponse, FlashcardDetail } from '@/types/flashcard';
import { updateFlashcardListSchema, UpdateFlashcardListFormData } from '@/lib/schema';
import { toast } from 'sonner';
import Link from 'next/link';

export function FlashcardEditContent() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [flashcards, setFlashcards] = useState<FlashcardDetail[]>([]);
  const [list, setList] = useState<ListDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [isSticky, setIsSticky] = useState(false);

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    flashcards?: Record<number, { frontText?: string; backText?: string; category?: string }>;
  }>({});

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsSticky(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (id && hasHydrated && user) {
      fetchData();
    }
  }, [id, hasHydrated, user]);

  useEffect(() => {
    if (list) {
      setTitle(list.listName);
      setDescription(list.description);
      setFlashcards(list.flashcards);
    }
  }, [list]);

  const handleSave = async () => {
    const validation = updateFlashcardListSchema.safeParse({
      listName: title,
      description,
      flashcards,
    });
  
    if (!validation.success) {
      const newErrors: typeof errors = { flashcards: {} };
  
      validation.error.errors.forEach((err) => {
        const field = err.path[0];
        if (field === 'listName') newErrors.title = err.message;
        if (field === 'description') newErrors.description = err.message;
  
        // Xử lý lỗi cho từng flashcard
        if (field === 'flashcards' && typeof err.path[1] === 'number') {
          const idx = err.path[1];
          const key = err.path[2] as 'frontText' | 'backText' | 'category';
          if (!newErrors.flashcards![idx]) newErrors.flashcards![idx] = {};
          newErrors.flashcards![idx][key] = err.message;
        }
      });
  
      setErrors(newErrors);
      return;
    }
  
    setErrors({});
    
    try {
      const payload: UpdateFlashcardListFormData = validation.data;
      const res = await updateFlashcardList(id as string, payload);

      // Nếu API có trả về success thì kiểm tra:
      if (res?.success !== false) {
        toast.success('Lưu thành công!');
        router.push(`/flashcards/${id}`);
      } else {
        toast.error('Lưu thất bại, vui lòng thử lại!');
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Đã xảy ra lỗi, vui lòng thử lại sau!";
      toast.error(errorMessage);
    }
  };

  const handleAddCard = () => {
    const maxId = flashcards.reduce((max, card) => Math.max(max, card.cardId), 0);
    setFlashcards([
      ...flashcards,
      {
        cardId: maxId ? maxId + 1 : 1,
        frontText: '',
        backText: '',
      },
    ]);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [listRes] = await Promise.all([
        getFlashcardListDetail(id as string)     
      ]);
      setList(listRes);
    } catch (err) {
      toast.error('Lỗi khi lấy dữ liệu danh sách. Vui lòng thử lại.');
      console.error('Lỗi khi fetch dữ liệu:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {user && list && !isLoading && (
        <div>
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
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>)}
              <p className="text-sm font-medium text-gray-600 mb-1">Mô tả</p>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>)}
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
                      {errors.flashcards?.[index]?.frontText && (
                        <p className="text-red-500 text-sm mt-1">{errors.flashcards[index].frontText}</p>
                      )}
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
                      {errors.flashcards?.[index]?.category && (
                        <p className="text-red-500 text-sm mt-1">{errors.flashcards[index].category}</p>
                      )}
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
                    {errors.flashcards?.[index]?.backText && (
                      <p className="text-red-500 text-sm mt-1">{errors.flashcards[index].backText}</p>
                    )}
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
      )}
      {!user && (
        <div className="text-center text-gray-500 text-sm mt-8">
          Vui lòng <Link href="/login" className="text-blue-600 underline">đăng nhập</Link> để chỉnh sửa danh sách flash card
        </div>
      )}
      {user && isLoading && (
        <div className="flex justify-center py-12">
          <Loader className="h-6 w-6 text-gray-500 animate-spin" />
        </div>
      )}
    </div>
  );
}

export function FlashcardEditLoading() {
  return (
    <div className="flex justify-center py-12">
      <Loader className="h-6 w-6 text-gray-500 animate-spin" />
    </div>
  );
}
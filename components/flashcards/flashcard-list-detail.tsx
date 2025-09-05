'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { getFlashcardListDetail, createFlashcard, updateFlashcard, 
  deleteFlashcard, toggleFlashcardListPublic, 
  getPaginatedFlashcards, markListInProgress, stopLearningFlashcardList, deleteFlashcardList } from '@/lib/api/flashcard';
import { ListDetailResponse, FlashcardDetail } from '@/types/flashcard';
import { Edit2, Trash2, Loader, MoreVertical, Plus, Play } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Lock, Globe2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createFlashcardSchema, CreateFlashcardFormData } from '@/lib/schema';


export function FlashcardListDetailContent() {
  const { id } = useParams();
  const [list, setList] = useState<ListDetailResponse | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState<CreateFlashcardFormData>({
    frontText: '',
    backText: '',
    category: '',
  });
  const [errors, setErrors] = useState<{ frontText?: string; backText?: string; category?: string }>({});
  const [editingCard, setEditingCard] = useState<FlashcardDetail | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashcardDetail[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();
  
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const handleAddFlashcard = async () => {
    const validation = createFlashcardSchema.safeParse(formData);

    if (!validation.success) {
      const fieldErrors: { frontText?: string; backText?: string; category?: string } = {};
      validation.error.errors.forEach((e) => {
        if (e.path[0] === 'frontText') fieldErrors.frontText = e.message;
        if (e.path[0] === 'backText') fieldErrors.backText = e.message;
        if (e.path[0] === 'category') fieldErrors.category = e.message;
      });
      setErrors(fieldErrors);
      return;
    } else {
      setErrors({});
    }

    try {
      await createFlashcard(id as string, validation.data);
      setIsAddOpen(false);
      setFormData({ frontText: '', backText: '', category: ''});
      getFlashcardListDetail(id as string).then(setList);
      fetchData(currentPage);
      toast.success('Thêm flashcard thành công!');
    } catch (e : any) {
      const errorMessage = e?.message || 'Không thể thêm flashcard. Vui lòng thử lại sau.'
      toast.error(errorMessage);
    }
  };

  const handleUpdateFlashcard = async () => {
    if (!editingCard || !id) return;

    const validation = createFlashcardSchema.safeParse({
      frontText: editingCard.frontText,
      backText: editingCard.backText,
      category: editingCard.category,
    });

    if (!validation.success) {
      const fieldErrors: { frontText?: string; backText?: string; category?: string } = {};
      validation.error.errors.forEach((e) => {
        if (e.path[0] === 'frontText') fieldErrors.frontText = e.message;
        if (e.path[0] === 'backText') fieldErrors.backText = e.message;
        if (e.path[0] === 'category') fieldErrors.category = e.message;
      });
      setErrors(fieldErrors);
      return;
    } else {
      setErrors({});
    }

    try {
      const payload: CreateFlashcardFormData = validation.data;
      await updateFlashcard(
        parseInt(id as string),
        editingCard.cardId,
        payload
      );
    
      setIsEditOpen(false);
      getFlashcardListDetail(id as string).then(setList);
      fetchData(currentPage);
      toast.success("Cập nhật flashcard thành công!");
    }catch (e : any) {
      const errorMessage = e?.message || "Không cập nhật thông tin flashcard. Vui lòng thử lại sau.";
      toast.error(errorMessage);
    }
  };

  const handleDeleteFlashcard = async (cardId: number) => {
    if (!id) return;
    try {
      await deleteFlashcard(id as string, cardId);
      const updatedList = await getFlashcardListDetail(id as string);
      setList(updatedList);
      const newTotalPages = Math.ceil(updatedList.flashcards.length / 10);
      const newPage = currentPage > newTotalPages ? newTotalPages : currentPage;
      setCurrentPage(newPage);
      fetchData(newPage);
    } catch (e) {
      toast.error('Xoá flashcard thất bại. Vui lòng thử lại.');
    }
  };

  const handleTogglePublic = async () => {
    if (!id) return;
    try {
      const res = await toggleFlashcardListPublic(id as string);
      setList(prev => prev ? { ...prev, isPublic: res.isPublic } : prev);
    } catch (err) {
      toast.error('Lỗi khi thay đổi trạng thái. Vui lòng thử lại.');
    }
  };

  const handleDeleteList = async () => {
    try {
      await deleteFlashcardList(id as string);
      toast.success('Đã xoá danh sách thành công!');
      router.push('/flashcards');
    } catch (e) {
      toast.error('Xoá danh sách thất bại. Vui lòng thử lại.');
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };
  
  const fetchData = async (page = 1) => {
    setIsLoading(true);
    try {
      const [listRes, flashcardRes] = await Promise.all([
        getFlashcardListDetail(id as string),
        getPaginatedFlashcards(id as string, page),
      ]);
      setList(listRes);
      setFlashcards(flashcardRes.result);
      setCurrentPage(flashcardRes.meta.page);
      setTotalPages(flashcardRes.meta.pages);
    } catch (err) {
      toast.error('Lỗi khi lấy dữ liệu flashcards. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const startLearning = async () => {
    await markListInProgress(id as string);
    router.push(`/flashcards/${id}/study`);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant="outline"
          size="sm"
          onClick={() => fetchData(1)}
          className="h-8 w-8 p-0"
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="text-gray-400">...</span>);
      }
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => fetchData(i)}
          className="h-8 w-8 p-0"
        >
          {i}
        </Button>
      );
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="text-gray-400">...</span>);
      }
      pages.push(
        <Button
          key={totalPages}
          variant="outline"
          size="sm"
          onClick={() => fetchData(totalPages)}
          className="h-8 w-8 p-0"
        >
          {totalPages}
        </Button>
      );
    }

    return (
      <div className="flex justify-center items-center gap-1 mt-8 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => fetchData(currentPage - 1)}
          className="h-8 px-2"
        >
          &larr;
        </Button>
        {pages}
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => fetchData(currentPage + 1)}
          className="h-8 px-2"
        >
          &rarr;
        </Button>
      </div>
    );
  };

  useEffect(() => {
    if (id && hasHydrated && user) {
      fetchData();
    }
  }, [id, hasHydrated, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 text-gray-500 animate-spin" />
      </div>
    );
  } 

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header Section - Mobile Optimized */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {list?.listName}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {list?.flashcards?.length || 0} flashcards
              </p>
            </div>
            
            {/* Desktop Action Buttons */}
            {list?.isOwner && (
              <>
                {/* Desktop Actions */}
                <div className="hidden sm:flex gap-2 flex-wrap">
                  <Button
                    onClick={handleTogglePublic}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    {list.isPublic ? <Globe2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    <span className="hidden md:inline">
                      {list.isPublic ? 'Public' : 'Private'}
                    </span>
                  </Button>
                  <Button 
                    onClick={() => setIsAddOpen(true)}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden md:inline">Thêm từ</span>
                  </Button>
                  <Button 
                    onClick={() => router.push(`/flashcards/${id}/edit`)} 
                    variant="outline"
                    size="sm"
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    onClick={() => setIsDeleteDialogOpen(true)}
                    variant="destructive"
                    size="sm"
                  >
                    Xoá
                  </Button>
                </div>

                {/* Mobile Actions Dropdown */}
                <div className="sm:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setIsAddOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm từ mới
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/flashcards/${id}/edit`)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Chỉnh sửa danh sách
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleTogglePublic}>
                        {list.isPublic ? <Lock className="w-4 h-4 mr-2" /> : <Globe2 className="w-4 h-4 mr-2" />}
                        {list.isPublic ? 'Chuyển về Private' : 'Chuyển sang Public'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xoá danh sách
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Study Actions */}
        {list?.flashcards?.length && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
            <Button 
              onClick={startLearning} 
              className="w-full flex items-center justify-center gap-2 h-12 bg-blue-600 hover:bg-blue-500"
              size="lg"
            >
              <Play className="w-5 h-5" />
              Luyện tập flashcards
            </Button>

            {list?.inProgress && (
              <Button
                variant="ghost"
                className="w-full mt-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={async () => {
                  try {
                    await stopLearningFlashcardList(id as string);
                    router.push(`/flashcards/`);
                  } catch (err) {
                    toast.error("Lỗi khi dừng học. Vui lòng thử lại.");
                  }
                }}
              >
                Dừng học list này
              </Button>
            )}
          </div>
        )}

        {/* Flashcards List */}
        <div className="space-y-3 sm:space-y-4">
          {flashcards.map((card) => (
            <div key={card.cardId} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 break-words">
                        {card.frontText}
                      </h3>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md self-start">
                        {card.category}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Định nghĩa:</span>
                      <p className="mt-1 break-words">{card.backText}</p>
                    </div>
                  </div>
                  
                  {list?.isOwner && (
                    <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCard(card);
                          setIsEditOpen(true);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFlashcard(card.cardId)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {flashcards.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 mb-4">Chưa có flashcard nào trong danh sách này</p>
            {list?.isOwner && (
              <Button onClick={() => setIsAddOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm flashcard đầu tiên
              </Button>
            )}
          </div>
        )}

        {renderPagination()}

        {/* Add Flashcard Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="w-full max-w-md mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle>Tạo flashcard</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Từ mới</label>
                <Input
                  value={formData.frontText}
                  onChange={(e) => setFormData({ ...formData, frontText: e.target.value })}
                  className="w-full"
                />
                {errors.frontText && <p className="text-red-500 text-sm mt-1">{errors.frontText}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Định nghĩa</label>
                <Textarea
                  value={formData.backText}
                  onChange={(e) => setFormData({ ...formData, backText: e.target.value })}
                  className="w-full min-h-[80px]"
                />
                {errors.backText && <p className="text-red-500 text-sm mt-1">{errors.backText}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Loại từ</label>
                <select
                  className="w-full border rounded px-3 py-2"
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
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Huỷ</Button>
              <Button onClick={handleAddFlashcard}>Lưu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Flashcard Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="w-full max-w-md mx-4 sm:mx-auto">
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
                    className="w-full"
                  />
                  {errors.frontText && <p className="text-red-500 text-sm mt-1">{errors.frontText}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Định nghĩa</label>
                  <Textarea
                    value={editingCard.backText}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, backText: e.target.value })
                    }
                    className="w-full min-h-[80px]"
                  />
                  {errors.backText && <p className="text-red-500 text-sm mt-1">{errors.backText}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Loại từ</label>
                  <select
                    className="w-full border rounded px-3 py-2"
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
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>
              </div>
            )}

            <DialogFooter className="mt-6 gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Huỷ</Button>
              <Button onClick={handleUpdateFlashcard}>Lưu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete List Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="w-full max-w-md mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle>Xác nhận xoá danh sách?</DialogTitle>
            </DialogHeader>
            <p className="text-gray-600">
              Bạn có chắc chắn muốn xoá danh sách này và toàn bộ các flashcard bên trong?
            </p>
            <DialogFooter className="mt-6 gap-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Huỷ</Button>
              <Button variant="destructive" onClick={handleDeleteList}>Xoá</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export function FlashcardListDetailLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader className="h-8 w-8 text-gray-500 animate-spin" />
    </div>
  );
}

export function FlashcardListDetailWrapper() {
  return <FlashcardListDetailContent />;
}
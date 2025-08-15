'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { getFlashcardListDetail } from '@/lib/api/flashcard';
import { ListDetailResponse } from '@/types/flashcard';
import { Layers, Brain, FileText, Loader } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TestDialog from '@/components/ui/test-dialog';
import { toast } from 'sonner';

export function FlashcardStudyContent() {
  const { id } = useParams();
  
  const [list, setList] = useState<ListDetailResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const router = useRouter();
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  
  const modes = [
    { label: 'Flashcards', icon: Layers, href: `/flashcards/${id}/study` },
    { label: 'Learn', icon: Brain, href: `/flashcards/${id}/learn` },
    { label: 'Test', icon: FileText, action: () => setShowTestDialog(true) },
  ];  

  const getHintText = () => {
    if (!list?.flashcards[currentIndex] || !list?.flashcards[currentIndex].backText) return '';
    const firstWord = list?.flashcards[currentIndex].backText.trim().split(' ')[0];
    return `${firstWord} _____`;
  };

  const toggleHint = () => setHintShown((prev) => !prev);
  const flipCard = () => setShowBack((prev) => !prev);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const listRes = await getFlashcardListDetail(id as string);
      setList(listRes);
    } catch (err) {
      toast.error('Lỗi khi lấy dữ liệu danh sách. Vui lòng thử lại.');
      console.error('Lỗi khi fetch dữ liệu:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id && hasHydrated && user) {
      fetchData();
    }
  }, [id, hasHydrated, user]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-center">
      {/* Flashcard */}
      {user && list?.flashcards[currentIndex] && !isLoading && (
        <div>
          {/* Tiêu đề */}
          <h1 className="text-3xl font-bold mb-6">{list?.listName}</h1>

          {/* Chế độ luyện tập */}
          <div className="grid grid-cols-3 gap-3 mb-10">
            {modes.map(({ label, icon: Icon, href, action }) => (
              href ? (
                <Link key={label} href={href} passHref>
                  <Button
                    variant="outline"
                    className="py-6 text-base font-semibold flex items-center gap-1 w-full justify-center"
                  >
                    <Icon className="h-6 w-6 text-blue-600" />
                    <span>{label}</span>
                  </Button>
                </Link>
              ) : (
                <Button
                  key={label}
                  onClick={action}
                  variant="outline"
                  className="py-6 text-base font-semibold flex items-center gap-1 w-full justify-center"
                >
                  <Icon className="h-6 w-6 text-blue-600" />
                  <span>{label}</span>
                </Button>
              )
            ))}
          </div>

          <div className="relative perspective-1000">
            <div
              onClick={flipCard}
              className={`transition-transform duration-500 transform-style-preserve-3d cursor-pointer w-full min-h-[300px] flex items-center justify-center rounded-xl shadow-lg bg-white relative`}
              style={{
                transform: showBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 0.6s',
              }}
            >
              {/* Front */}
              <div
                className={`absolute w-full h-full px-8 py-6 flex flex-col justify-center items-center backface-hidden ${
                  showBack ? 'rotate-y-180 opacity-0' : 'opacity-100'
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleHint();
                  }}
                  className={`text-sm text-gray-500 absolute top-4 left-4 cursor-pointer pl-2 pr-3 pt-1 pb-1 duration-300 ${
                    hintShown && 'bg-gray-200 rounded-2xl'
                  }`}
                >
                  {hintShown ? `💡 ${getHintText()}` : '💡 Get a hint'}
                </button>

                <p className="text-2xl font-medium text-gray-800 mb-2">{list?.flashcards[currentIndex].frontText}</p>
                {list?.flashcards[currentIndex].category && (
                  <p className="text-sm text-gray-400">{`(${list?.flashcards[currentIndex].category})`}</p>
                )}
              </div>

              {/* Back */}
              <div
                className={`absolute w-full h-full px-8 py-6 flex justify-center items-center rotate-y-180 backface-hidden ${
                  showBack ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <p className="text-2xl font-medium text-gray-800">{list?.flashcards[currentIndex].backText}</p>
              </div>
            </div>
          </div>

          {/* Điều hướng */}
          {(list?.flashcards.length !== undefined) && (list?.flashcards.length > 1) && (
            <div className="mt-6 flex justify-center items-center gap-6">
              <button
                onClick={() => {
                  setShowBack(false);
                  setHintShown(false);
                  setCurrentIndex((prev) => Math.max(0, prev - 1));
                }}
                disabled={currentIndex === 0}
                className={`w-16 h-10 rounded-full border ${
                  currentIndex === 0
                    ? 'border-gray-300 text-gray-300 cursor-not-allowed'
                    : 'border-gray-400 text-gray-600 hover:bg-gray-100'
                } flex items-center justify-center text-xl`}
              >
                ←
              </button>

              <p className="text-gray-600 font-medium text-base">
                {currentIndex + 1} / {list?.flashcards.length}
              </p>

              <button
                onClick={() => {
                  setShowBack(false);
                  setHintShown(false);
                  setCurrentIndex((prev) => Math.min(list?.flashcards.length - 1, prev + 1));
                }}
                disabled={currentIndex === list?.flashcards.length - 1}
                className={`w-16 h-10 rounded-full border ${
                  currentIndex === list?.flashcards.length - 1
                    ? 'border-gray-300 text-gray-300 cursor-not-allowed'
                    : 'border-gray-400 text-gray-600 hover:bg-gray-100'
                } flex items-center justify-center text-xl`}
              >
                →
              </button>
            </div>
          )}
        </div>
      )}
      
      {!user && (
        <div className="text-center text-gray-500 text-sm mt-8">
          Vui lòng <Link href="/login" className="text-blue-600 underline">đăng nhập</Link> để luyện tập với flash card
        </div>
      )}
      
      {user && isLoading && (
        <div className="flex justify-center py-12">
          <Loader className="h-6 w-6 text-gray-500 animate-spin" />
        </div>
      )}

    <TestDialog
      open={showTestDialog}
      max={Math.min(50, list?.flashcards.length || 0)}
      defaultCount={
        (list?.flashcards.length || 0) > 20
          ? 20
          : Math.floor((list?.flashcards.length || 0) / 2)
      }
      // optional: defaultTypes={['truefalse','multiple','written']}
      onConfirm={(count, types) => {
        setShowTestDialog(false);
        const typesParam = encodeURIComponent(types.join(','));
        router.push(`/flashcards/${id}/test?count=${count}&types=${typesParam}`);
      }}
      onClose={() => setShowTestDialog(false)}
    />
    </div>
  );
}

// Loading component
export function FlashcardStudyLoading() {
  return (
    <div className="flex justify-center py-12">
      <Loader className="h-6 w-6 text-gray-500 animate-spin" />
    </div>
  );
}
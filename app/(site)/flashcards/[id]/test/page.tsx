'use client';

import { useSearchParams, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getFlashcardListDetail } from '@/lib/api/flashcard';
import { useAuthStore } from '@/store/auth';
import { ListDetailResponse, TestQuestion, QuestionTypeTest, FlashcardDetail } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import FullPageLoader from '@/components/common/full-page-loader';
import { ArrowLeft } from 'lucide-react';


export default function FlashcardTestPage() {
  const { id } = useParams();
  
  const searchParams = useSearchParams();
  const count = parseInt(searchParams.get('count') || '0');

  const [list, setList] = useState<ListDetailResponse | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  

  const fetchData = async () => {
    try {
      const listRes = await getFlashcardListDetail(id as string);
      setList(listRes);
      console.log(listRes);
  
      // Lấy ngẫu nhiên flashcards từ listRes, không phải từ state list (vì chưa kịp cập nhật)
      const flashcards = [...listRes.flashcards].sort(() => Math.random() - 0.5).slice(0, count);
  
      const generated: TestQuestion[] = flashcards.map((card): TestQuestion => {
        const types: QuestionTypeTest[] = ['truefalse', 'multiple', 'written'];
        const type = types[Math.floor(Math.random() * types.length)];
  
        let q: TestQuestion = {
          type,
          frontText: card.frontText,
          backText: card.backText,
        };
  
        if (type === 'multiple') {
          const otherOptions = listRes.flashcards
            .filter((c: FlashcardDetail) => c.backText !== card.backText)
            .slice(0, 3)
            .map((c: FlashcardDetail) => c.backText);
  
          q.options = [...otherOptions, card.backText].sort(() => Math.random() - 0.5);
        }
  
        return q;
      });

      setQuestions(generated);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu flashcard:', error);
    } 
  };
  
  const handleSubmit = () => setSubmitted(true);

  const correctCount = questions.reduce((total, q, idx) => {
    const userAnswer = answers[idx]?.trim().toLowerCase();
  
    if (q.type === 'written') {
      return userAnswer === q.frontText.trim().toLowerCase() ? total + 1 : total;
    }
  
    if (q.type === 'multiple') {
      return userAnswer === q.backText.trim().toLowerCase() ? total + 1 : total;
    }
  
    if (q.type === 'truefalse') {
      const matched = list?.flashcards.find(
        (f) => f.frontText === q.frontText && f.backText === q.backText
      );
      const shouldBeTrue = Boolean(matched);
      return (userAnswer === 'true') === shouldBeTrue ? total + 1 : total;
    }
  
    return total;
  }, 0);
  

  const renderQuestion = (q: TestQuestion, idx: number) => {
    const isCorrectAnswer = ((): boolean => {
      const userAnswer = answers[idx]?.trim().toLowerCase();
      const correctAnswer = q.backText.trim().toLowerCase();
      
      if (q.type === 'written') {
        return userAnswer === q.frontText.trim().toLowerCase();
      }
  
      if (q.type === 'multiple') {
        return userAnswer === correctAnswer;
      }
  
      if (q.type === 'truefalse') {
        // Kiểm tra backText có thực sự là của frontText hay không
        const matched = list?.flashcards.find(
          (f) => f.frontText === q.frontText && f.backText === q.backText
        );
        const shouldBeTrue = Boolean(matched);
        return (userAnswer === 'true') === shouldBeTrue;
      }
  
      return false;
    })();
  
    return (
      <div key={idx} className="mb-6 border rounded-lg p-4 shadow-sm text-left bg-white">
        {/* Multiple choice */}
        {q.type === 'multiple' && (
          <>
            <p className="text-lg font-semibold mb-2">Từ: {q.frontText}</p>
            <div className="grid grid-cols-2 gap-2">
              {q.options?.map((opt, i) => (
                <Button
                  key={i}
                  variant={answers[idx] === opt ? 'default' : 'outline'}
                  onClick={() => setAnswers({ ...answers, [idx]: opt })}
                  disabled={submitted}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </>
        )}
  
        {/* True/False */}
        {q.type === 'truefalse' && (
          <>
            <div className="flex items-center justify-between gap-3 text-base font-medium text-gray-700 mb-3">
              <span>Từ: {q.frontText}</span>
              <span className="text-gray-400">|</span>
              <span>Định nghĩa: {q.backText}</span>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <Button
                className="w-2xs"
                variant={answers[idx] === 'true' ? 'default' : 'outline'}
                onClick={() => setAnswers({ ...answers, [idx]: 'true' })}
                disabled={submitted}
              >
                True
              </Button>
              <Button
                className="w-2xs"
                variant={answers[idx] === 'false' ? 'default' : 'outline'}
                onClick={() => setAnswers({ ...answers, [idx]: 'false' })}
                disabled={submitted}
              >
                False
              </Button>
            </div>
          </>
        )}
  
        {/* Written */}
        {q.type === 'written' && (
          <>
            <p className="text-lg font-semibold mb-2">Định nghĩa: {q.backText}</p>
            <input
              type="text"
              className="border rounded px-3 py-2 w-full mt-2"
              placeholder="Nhập từ tiếng Anh..."
              value={answers[idx] || ''}
              onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
              disabled={submitted}
            />
          </>
        )}
  
        {submitted && (
          <p className={`mt-2 text-sm ${isCorrectAnswer ? 'text-green-600' : 'text-red-500'}`}>
            Đáp án đúng: <span className="font-semibold">{q.frontText} : {q.backText}</span>
          </p>
        )}
      </div>
    );
  };

  
  useEffect(() => {
    if (id && count && hasHydrated && user) {
      fetchData();
    }
  }, [id, count, hasHydrated, user]);

  if (!hasHydrated) return <FullPageLoader />;
  return (
    <div className="relative max-w-3xl mx-auto px-4 py-8">
      <Button
        onClick={() => router.push(`/flashcards/${id}/study`)}
        variant="outline"
        size="icon"
        className="absolute pl-4 pr-4 w-12 rounded-2xl cursor-pointer left-4 top-4 border-black hover:bg-black hover:text-white transition"
        title="Quay về trang học"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="text-2xl font-bold text-center mb-6">📝 Bài kiểm tra từ vựng</h1>
      {user && questions.map((q, idx) => renderQuestion(q, idx))}
      {user && (
        !submitted ? (
        <Button className="mt-6 w-full" onClick={handleSubmit}>
          Nộp bài
        </Button>
        ) : (
          <div className="mt-6 text-center space-y-4">
            <p className="text-xl font-bold">✅ Đúng: {correctCount} / {questions.length}</p>
            <Button
              className="w-full"
              onClick={() => router.push(`/flashcards/${id}/study`)}
              >
              Hoàn thành
            </Button>
          </div>
        )
      )}

    </div>
  );
}

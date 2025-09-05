'use client';

import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getFlashcardListDetail } from '@/lib/api/flashcard';
import { useAuthStore } from '@/store/auth';
import { ListDetailResponse, TestQuestion, QuestionTypeTest, FlashcardDetail } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import FullPageLoader from '@/components/common/full-page-loader';
import { ArrowLeft } from 'lucide-react';

const ALL_TYPES: QuestionTypeTest[] = ['truefalse','multiple','written'];

export function FlashcardTestContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const count = parseInt(searchParams.get('count') || '0');
  const typesParam = searchParams.get('types');

  // parse types từ query; nếu không có -> dùng tất cả
  const selectedTypes: QuestionTypeTest[] = (() => {
    if (!typesParam) return ALL_TYPES;
    const parts = typesParam.split(',').map(s => s.trim().toLowerCase());
    const valid = parts.filter((t): t is QuestionTypeTest => (ALL_TYPES as string[]).includes(t));
    return valid.length ? (valid as QuestionTypeTest[]) : ALL_TYPES;
  })();

  const [list, setList] = useState<ListDetailResponse | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    if (id && count && hasHydrated && user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, count, hasHydrated, user, typesParam]);

  const fetchData = async () => {
    try {
      const listRes = await getFlashcardListDetail(id as string);
      setList(listRes);

      // 1) Chọn ngẫu nhiên N flashcards
      const pool = [...listRes.flashcards].sort(() => Math.random() - 0.5);
      const N = Math.min(pool.length, count || pool.length);
      const selected = pool.slice(0, N);

      // 2) Tạo kế hoạch phân phối loại câu hỏi theo selectedTypes
      //    - chia đều N cho K loại
      //    - phần dư dồn vào loại CUỐI cùng trong selectedTypes
      const K = selectedTypes.length;
      const base = Math.floor(N / K);
      const remainder = N % K;

      const plan: QuestionTypeTest[] = [];
      selectedTypes.forEach((t, idx) => {
        const add = base + (idx === K - 1 ? remainder : 0);
        for (let i = 0; i < add; i++) plan.push(t);
      });

      // 3) Map từng flashcard -> question theo plan
      const generated: TestQuestion[] = selected.map((card, idx): TestQuestion => {
        const type = plan[idx] ?? 'written';
        let q: TestQuestion = {
          type,
          frontText: card.frontText,
          backText: card.backText,
        };

        if (type === 'multiple') {
          const otherOptions = pickRandomDistinct(listRes.flashcards, card.backText, 3);
          q.options = [...otherOptions, card.backText].sort(() => Math.random() - 0.5);
        }

        if (type === 'truefalse') {
          const isTrue = Math.random() < 0.5;
          q.isTrueStatement = isTrue;
          q.correctBackText = card.backText;
          if (!isTrue) {
            // chọn 1 backText khác; nếu ko có thì để câu đúng
            const wrong = listRes.flashcards.find((c: FlashcardDetail) => c.frontText !== card.frontText);
            if (wrong) q.backText = wrong.backText;
          }
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
    if (q.type === 'written')  return userAnswer === q.frontText.trim().toLowerCase() ? total + 1 : total;
    if (q.type === 'multiple') return userAnswer === q.backText.trim().toLowerCase() ? total + 1 : total;
    if (q.type === 'truefalse') return (userAnswer === 'true') === q.isTrueStatement ? total + 1 : total;
    return total;
  }, 0);

  function pickRandomDistinct(
    pool: FlashcardDetail[],
    excludeBackText: string,
    n: number
  ): string[] {
    const candidates = Array.from(new Set(pool.filter(c => c.backText !== excludeBackText).map(c => c.backText)));
    const shuffled = candidates.sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, n);
    if (picked.length < n) {
      const more = pool.map(c => c.backText).filter(bt => bt !== excludeBackText && !picked.includes(bt));
      more.sort(() => Math.random() - 0.5);
      picked.push(...more.slice(0, n - picked.length));
    }
    return picked.slice(0, n);
  }

  const renderQuestion = (q: TestQuestion, idx: number) => {
    const userAnswer = answers[idx]?.trim().toLowerCase();
    const isCorrect =
      q.type === 'written'  ? userAnswer === q.frontText.trim().toLowerCase()
    : q.type === 'multiple' ? userAnswer === q.backText.trim().toLowerCase()
    : q.type === 'truefalse' ? (userAnswer === 'true') === q.isTrueStatement
    : false;

    return (
      <div key={idx} className="mb-4 sm:mb-6 border rounded-xl p-3 sm:p-4 shadow-sm text-left bg-white">
        {/* Question number indicator */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs sm:text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Câu {idx + 1}/{questions.length}
          </span>
        </div>

        {q.type === 'multiple' && (
          <>
            <div className="mb-4">
              <p className="text-sm sm:text-base font-medium text-gray-600 mb-1">Từ:</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900 break-words">{q.frontText}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 mb-3">Chọn định nghĩa đúng:</p>
              {q.options?.map((opt, i) => (
                <Button
                  key={i}
                  variant={answers[idx] === opt ? 'default' : 'outline'}
                  onClick={() => setAnswers({ ...answers, [idx]: opt })}
                  disabled={submitted}
                  className="w-full text-left justify-start h-auto py-3 px-4 text-sm sm:text-base whitespace-normal break-words"
                >
                  <span className="block w-full text-left leading-relaxed">{opt}</span>
                </Button>
              ))}
            </div>
          </>
        )}

        {q.type === 'truefalse' && (
          <>
            <div className="space-y-3 mb-4">
              <div>
                <p className="text-sm sm:text-base font-medium text-gray-600 mb-1">Từ:</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 break-words">{q.frontText}</p>
              </div>
              <div>
                <p className="text-sm sm:text-base font-medium text-gray-600 mb-1">Định nghĩa:</p>
                <p className="text-base sm:text-lg text-gray-900 break-words leading-relaxed">{q.backText}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 mb-3">Định nghĩa này có đúng không?</p>
              <div className="flex gap-3">
                <Button
                  className="flex-1 py-3 text-base font-medium"
                  variant={answers[idx] === 'true' ? 'default' : 'outline'}
                  onClick={() => setAnswers({ ...answers, [idx]: 'true' })}
                  disabled={submitted}
                >
                  ✓ Đúng
                </Button>
                <Button
                  className="flex-1 py-3 text-base font-medium"
                  variant={answers[idx] === 'false' ? 'default' : 'outline'}
                  onClick={() => setAnswers({ ...answers, [idx]: 'false' })}
                  disabled={submitted}
                >
                  ✗ Sai
                </Button>
              </div>
            </div>
          </>
        )}

        {q.type === 'written' && (
          <>
            <div className="mb-4">
              <p className="text-sm sm:text-base font-medium text-gray-600 mb-1">Định nghĩa:</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900 break-words leading-relaxed">{q.backText}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Nhập từ tiếng Anh tương ứng:</label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg px-4 py-3 w-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập câu trả lời..."
                value={answers[idx] || ''}
                onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                disabled={submitted}
              />
            </div>
          </>
        )}

        {submitted && (
          <div className={`mt-4 p-3 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start gap-2">
              <span className={`text-lg ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? '✓' : '✗'}
              </span>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'} mb-1`}>
                  {isCorrect ? 'Chính xác!' : 'Không chính xác'}
                </p>
                <p className={`text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'} break-words leading-relaxed`}>
                  <span className="font-semibold">Đáp án đúng: </span>
                  {q.type === 'truefalse'
                    ? `${q.frontText} : ${q.correctBackText}`
                    : `${q.frontText} : ${q.backText}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!hasHydrated) return <FullPageLoader />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Button
            onClick={() => router.push(`/flashcards/${id}/study`)}
            variant="outline"
            size="icon"
            className="rounded-full hover:bg-gray-100 transition-colors shrink-0"
            title="Quay về trang học"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              📝 Bài kiểm tra từ vựng
            </h1>
            {questions.length > 0 && (
              <p className="text-xs sm:text-sm text-gray-500">
                {questions.length} câu hỏi
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        {user && questions.map((q, idx) => renderQuestion(q, idx))}

        {user && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 mt-6">
            {!submitted ? (
              <Button 
                className="w-full py-3 text-base font-medium" 
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== questions.length}
              >
                Nộp bài ({Object.keys(answers).length}/{questions.length})
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-3 rounded-lg">
                    <span className="text-2xl">🎉</span>
                    <div>
                      <p className="text-lg font-bold text-blue-900">
                        Kết quả: {correctCount}/{questions.length}
                      </p>
                      <p className="text-sm text-blue-700">
                        Chính xác {Math.round((correctCount / questions.length) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full py-3 text-base font-medium" 
                  onClick={() => router.push(`/flashcards/${id}/study`)}
                >
                  Hoàn thành
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Loading component
export function FlashcardTestLoading() {
  return <FullPageLoader />;
}
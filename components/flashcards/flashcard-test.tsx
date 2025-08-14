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
      <div key={idx} className="mb-6 border rounded-lg p-4 shadow-sm text-left bg-white">
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
          <p className={`mt-2 text-sm ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
            Đáp án đúng: <span className="font-semibold">
              {q.type === 'truefalse'
                ? `${q.frontText} : ${q.correctBackText}`
                : `${q.frontText} : ${q.backText}`}
            </span>
          </p>
        )}
      </div>
    );
  };

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
            <Button className="w-full" onClick={() => router.push(`/flashcards/${id}/study`)}>
              Hoàn thành
            </Button>
          </div>
        )
      )}
    </div>
  );
}

// Loading component
export function FlashcardTestLoading() {
  return <FullPageLoader />;
}
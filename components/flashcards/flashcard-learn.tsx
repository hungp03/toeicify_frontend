// components/flashcards/flashcard-learn.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { getFlashcardListDetail } from '@/lib/api/flashcard';
import { ListDetailResponse, AnswerStatus, LearnCard } from '@/types/flashcard';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader } from 'lucide-react';

export function FlashcardLearnContent() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  const [list, setList] = useState<ListDetailResponse | null>(null);
  const [queue, setQueue] = useState<LearnCard[]>([]);
  const [clusterCount, setClusterCount] = useState(0);
  const [tempQueue, setTempQueue] = useState<LearnCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selected, setSelected] = useState('');
  const [choices, setChoices] = useState<string[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [disableInput, setDisableInput] = useState(false);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [mistakeStats, setMistakeStats] = useState<Record<number, { wrong: number, dontknow: number }>>({});
  const router = useRouter();

  const current = queue[currentIndex];
  const currentType = current?.type;
  const flash = list?.flashcards[current?.index];

  const getShuffledAnswers = (correct: string | undefined, flashcards: ListDetailResponse['flashcards']): string[] => {
    if (!correct) return [];
    const others = flashcards.filter(f => f.backText !== correct).map(f => f.backText);
    const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
    return [...shuffled, correct].sort(() => Math.random() - 0.5);
  };

  const generateQueue = (flashcards: ListDetailResponse['flashcards']): { queue: LearnCard[], clusterCount: number } => {
    const n = flashcards.length;
    let clusterCount: number;
    if (n <= 5) {
      clusterCount = 1;
    } else if (n <= 10) {
      clusterCount = 2;
    } else if (n <= 15) {
      clusterCount = 3;
    } else if (n <= 30) {
      clusterCount = 4;
    } else if (n <= 50) {
      clusterCount = 5;
    } else {
      clusterCount = Math.ceil(n / 10);
    }

    const baseSize = Math.floor(n / clusterCount);
    const remainder = n % clusterCount;
    const result: LearnCard[] = [];
    let startIndex = 0;
    for (let c = 0; c < clusterCount; c++) {
      const clusterSize = baseSize + (c < remainder ? 1 : 0);
      for (let i = 0; i < clusterSize; i++) {
        const idx = startIndex + i;
        result.push({ index: idx, type: 'multiple', cluster: c });
      }
      for (let i = 0; i < clusterSize; i++) {
        const idx = startIndex + i;
        result.push({ index: idx, type: 'fill', cluster: c });
      }
      startIndex += clusterSize;
    }
    return { queue: result, clusterCount: clusterCount };
  };

  useEffect(() => {
    if (id && hasHydrated && user) {
      getFlashcardListDetail(id as string).then((res) => {
        setList(res);
        const { queue: generatedQueue, clusterCount: cCount } = generateQueue(res.flashcards);
        setQueue(generatedQueue);
        setClusterCount(cCount);
        const first = generatedQueue[0];
        const firstFlash = res.flashcards[first.index];
        if (first.type === 'multiple') {
          setChoices(getShuffledAnswers(firstFlash.backText, res.flashcards));
        }
      });
    }
  }, [id, hasHydrated, user]);

  const handleAnswer = (status: AnswerStatus, isCorrect: boolean) => {
    const updated = [...queue];
    const currentCard = { ...updated[currentIndex] };
    currentCard.status = status;
    currentCard.seen = (currentCard.seen || 0) + 1;
    updated[currentIndex] = currentCard;

    if (status === 'wrong' || status === 'dontknow') {
        setMistakeStats((prev) => {
            const curr = prev[current.index] || { wrong: 0, dontknow: 0 };
            return {
              ...prev,
              [current.index]: {
                wrong: curr.wrong + (status === 'wrong' ? 1 : 0),
                dontknow: curr.dontknow + (status === 'dontknow' ? 1 : 0),
              },
            };
          });

      const moveTo = status === 'wrong'
        ? Math.min(currentIndex + 5, updated.length - 1)
        : (currentCard.seen === 1 
            ? Math.min(currentIndex + 2, updated.length - 1) 
            : Math.min(currentIndex + 10, updated.length - 1));
      const [card] = updated.splice(currentIndex, 1);
      updated.splice(moveTo, 0, card);
      setTempQueue(updated);
    } else {
      setFeedbackMsg('✅ Correct!');
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
        goToNext(updated);
      }, 700);
    }

    if (status !== 'correct') {
      setFeedbackMsg(status === 'wrong' ? '❌ Incorrect!' : '🤔 Let\'s learn this again.');
      setShowCorrectAnswer(true);
      setShowContinue(true);
      setDisableInput(true);
    }
  };

  const handleContinue = () => {
    setShowContinue(false);
    setShowCorrectAnswer(false);
    setDisableInput(false);
    setFeedbackMsg('');
  
    setQueue(tempQueue);
    setTempQueue([]);
  
    setSelected('');
    setAnswer('');
  
    const newCurrent = tempQueue[currentIndex];
    const newFlash = list?.flashcards[newCurrent.index];
    if (newCurrent?.type === 'multiple' && newFlash) {
      setChoices(getShuffledAnswers(newFlash.backText, list.flashcards));
    }
  };

  const goToNext = (updatedQueue: LearnCard[]) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= updatedQueue.length) {
        setShowFinalSummary(true);
        return;
    }
    setSelected('');
    setAnswer('');
    setCurrentIndex(nextIndex);
    setQueue(updatedQueue);

    const nextCard = updatedQueue[nextIndex];
    const nextFlash = list?.flashcards[nextCard.index];
    if (nextCard.type === 'multiple' && nextFlash) {
      setChoices(getShuffledAnswers(nextFlash.backText, list.flashcards));
    }
  };

  const correctCount = queue.filter((c) => c.status === 'correct').length;

  if (!user || !list || queue.length === 0 || !flash) {
    return (
      <div className="flex justify-center py-12">
          <Loader className="h-6 w-6 text-gray-500 animate-spin" />
      </div>
    )
  }

  const currentCluster = current.cluster + 1;

  if (showFinalSummary) {
    const mistakeEntries = Object.entries(mistakeStats).map(([idxStr, stat]) => {
        const idx = Number(idxStr);
        const flashcard = list.flashcards[idx];
        return {
          index: idx,
          ...flashcard,
          ...stat,
        };
      });
      
    const totalWrong = mistakeEntries.reduce((sum, m) => sum + m.wrong, 0);
    const totalDontKnow = mistakeEntries.reduce((sum, m) => sum + m.dontknow, 0);
      
    const mostWrong = mistakeEntries.length > 0
    ? mistakeEntries.reduce((prev, curr) => curr.wrong > prev.wrong ? curr : prev)
    : null;

    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Tổng kết</h2>
        <div className="text-left">
        <h3 className="font-semibold mb-2">Thống kê:</h3>
        <p>Tổng số câu trả lời sai: <strong>{totalWrong}</strong></p>
        <p>Tổng số câu chọn "Don't know": <strong>{totalDontKnow}</strong></p>
        {mostWrong && (
            <p className="mt-2">Câu sai nhiều nhất: <strong>{mostWrong.frontText} – {mostWrong.backText}</strong> ({mostWrong.wrong} lần)</p>
        )}

        <h3 className="font-semibold mt-6 mb-2">❗ Tất cả các từ sai hoặc không biết:</h3>
        <ul className="list-disc list-inside">
            {mistakeEntries.map((m) => (
            <li key={m.index}>
                <strong>{m.frontText}</strong> – {m.backText} | Sai: {m.wrong}, Don't know: {m.dontknow}
            </li>
            ))}
        </ul>
        </div>
        <Button
            className="w-full mt-2"
            onClick={() => router.push(`/flashcards/${id}/study`)}
            >
            Hoàn thành
        </Button>    
      </div>
    );
  }

  return (
    <div className="relative max-w-3xl mx-auto px-4 py-10 text-center">
      <Button
        onClick={() => router.push(`/flashcards/${id}/study`)}
        variant="outline"
        size="icon"
        className="absolute pl-4 pr-4 w-12 rounded-2xl cursor-pointer left-4 top-4 border-black hover:bg-black hover:text-white transition"
        title="Quay về trang học"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="text-2xl font-semibold mb-6">{list.listName} – Learn Mode</h1>
      <div className="flex justify-between text-sm mb-2">
        <span>{correctCount}</span>
        <span>{queue.length}</span>
      </div>
      <Progress value={(correctCount / queue.length) * 100} className="mb-6 h-3" />


      {currentType === 'multiple' ? (
        <>
          <p className="text-xl font-semibold mb-4">Từ: {flash.frontText}</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {choices.map((opt, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelected(opt);
                  handleAnswer(opt === flash.backText ? 'correct' : 'wrong', opt === flash.backText);
                }}
                className={clsx(
                  'border px-4 py-2 rounded',
                  selected && opt === flash.backText && 'border-green-500',
                  selected && opt === selected && opt !== flash.backText && 'border-red-500 bg-red-50'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
          <Button variant="ghost" onClick={() => handleAnswer('dontknow', false)}>Don't know</Button>

          {(showFeedback || showCorrectAnswer) && (
            <div className="mt-4 text-sm text-gray-600">{feedbackMsg}</div>
          )}
          {showCorrectAnswer && (
            <div className="text-sm text-gray-700 mt-1">
              Đáp án đúng: <strong>{flash.backText}</strong>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-xl font-semibold mb-4">Định nghĩa: {flash.backText}</p>
          <Input
            placeholder="Nhập từ tiếng Anh"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="mb-3"
            disabled={disableInput}
          />
          <div className="flex gap-4 justify-center">
            {!disableInput && (
              <>
                <Button
                  onClick={() => handleAnswer(
                    answer.trim().toLowerCase() === flash.frontText.trim().toLowerCase()
                      ? 'correct'
                      : 'wrong',
                    answer.trim().toLowerCase() === flash.frontText.trim().toLowerCase()
                  )}
                >
                  Answer
                </Button>
                <Button variant="ghost" onClick={() => handleAnswer('dontknow', false)}>Don't know</Button>
              </>
            )}
          </div>

          {(showFeedback || showCorrectAnswer) && (
            <div className="mt-4 text-sm text-gray-600">{feedbackMsg}</div>
          )}
          {showCorrectAnswer && (
            <div className="text-sm text-gray-700 mt-1">
              Đáp án đúng: <strong>{flash.frontText}</strong>
            </div>
          )}
        </>
      )}

      {showContinue && (
        <Button onClick={handleContinue} className="mt-4">Continue</Button>
      )}

    </div>
  );
}

// Loading component
export function FlashcardLearnLoading() {
  return (
    <div className="flex justify-center py-12">
      <Loader className="h-6 w-6 text-gray-500 animate-spin" />
    </div>
  );
}
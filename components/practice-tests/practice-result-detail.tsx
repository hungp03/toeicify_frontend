'use client';
import { useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Home,
  RotateCcw,
} from 'lucide-react';
import { getExamResults, getQuestionExplain } from '@/lib/api/exam';
import { toast } from 'sonner';
import { TestResult, QuestionExplainResponse } from '@/types';
import AnswerExplanationModal from './question-explain';

export default function TestResultsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [result, setResult] = useState<TestResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionExplainResponse | null>(null);
  const [selectedUserAnswer, setSelectedUserAnswer] = useState<string | null>(null);
  const [loadingExplainId, setLoadingExplainId] = useState<number | null>(null);
  const explainCache = useRef<Map<number, QuestionExplainResponse>>(new Map());

  const handleShowExplanation = async (questionId: number, userAnswer: string | null) => {
    const cached = explainCache.current.get(questionId);
    if (cached) {
      setSelectedQuestion(cached);
      setSelectedUserAnswer(userAnswer);
      setShowModal(true);
      return;
    }

    if (loadingExplainId === questionId) return;
    try {
      setLoadingExplainId(questionId);
      const res = await getQuestionExplain(questionId);
      const data = res.data as QuestionExplainResponse;

      // Lưu cache
      explainCache.current.set(questionId, data);

      setSelectedQuestion(data);
      setSelectedUserAnswer(userAnswer);
      setShowModal(true);
    } catch (err) {
      toast.error('Không thể tải giải thích câu hỏi.');
    } finally {
      setLoadingExplainId(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const fetchResult = async (attemptId: string) => {
    try {
      const response = await getExamResults(parseInt(attemptId));
      setResult(response.data);
    } catch (error: any) {
      if (error.code === 5) {
        toast.error("Bạn không có quyền xem kết quả này.");
        router.push('/');
        return;
      }
      setResult(null);
    }
  };
  useEffect(() => {
    if (params.id) {
      fetchResult(params.id);
    } else {
      router.push('/practice-tests');
    }
  }, [params.id, router]);

  const calculateCompletionTime = (startTime: string, submittedAt: string, completionTimeMinutes: number) => {
    // Nếu completionTimeMinutes có giá trị hợp lệ (> 0), sử dụng nó
    if (completionTimeMinutes > 0) {
      return completionTimeMinutes;
    }
    
    // Nếu không, tính từ startTime và submittedAt
    const start = new Date(startTime);
    const end = new Date(submittedAt);
    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60); // Convert to minutes
  };

  const formatTime = (startTime: string, submittedAt: string, completionTimeMinutes: number) => {
    const totalMinutes = calculateCompletionTime(startTime, submittedAt, completionTimeMinutes);
    
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.floor(totalMinutes % 60);
    const secs = Math.floor((totalMinutes % 1) * 60);

    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getAnswerIcon = (isCorrect: boolean | null) => {
    if (isCorrect === true) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (isCorrect === false) return <XCircle className="h-4 w-4 text-red-600" />;
    return <AlertCircle className="h-4 w-4 text-yellow-600" />;
  };

  const getAnswerBadge = (isCorrect: boolean | null) => {
    if (isCorrect === true)
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Đúng
        </Badge>
      );
    if (isCorrect === false) return <Badge variant="destructive">Sai</Badge>;
    return (
      <Badge variant="outline" className="border-yellow-500 text-yellow-700">
        Chưa trả lời
      </Badge>
    );
  };

  if (!result) {
    return <div className="container mx-auto px-4 py-8">Đang tải kết quả...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Kết quả bài thi</h1>
        <p className="text-muted-foreground">{result.examSummary.examName}</p>
        <span className="text-muted-foreground text-sm">
          Ngày nộp: {formatDate(result.submittedAt)}
        </span>
        <span className="text-muted-foreground text-sm ml-2">
          Thời gian hoàn thành: {formatTime(result.startTime, result.submittedAt, result.completionTimeMinutes)}
        </span>
      </div>

      {/* Overall Score */}
      {result.isFullTest &&
        <Card className="mb-8">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{result.totalScore}</div>
                <div className="text-sm text-muted-foreground">Tổng Điểm</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{result.listeningScore}</div>
                <div className="text-sm text-muted-foreground">Listening</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{result.readingScore}</div>
                <div className="text-sm text-muted-foreground">Reading</div>
              </div>
            </div>
          </CardContent>
        </Card>
      }

      {/* Parts Detail */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Tổng quan từng phần</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {result.partsDetail.map((part) => (
              <div key={part.partNumber} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">
                    Phần {part.partNumber}: {part.partName}
                  </h3>
                  <Badge variant="outline">
                    {part.correctAnswers}/{part.totalQuestions} câu đúng
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Độ chính xác</span>
                    <span className="font-medium">{part.accuracyPercent.toFixed(2)}%</span>
                  </div>
                  <Progress value={part.accuracyPercent} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Answers Detail */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Chi tiết bài làm</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Group every two answers into one row */}
          <div className="space-y-4">
            {Array.from({ length: Math.ceil(result.answersDetail.length / 2) }).map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.answersDetail
                  .slice(rowIndex * 2, rowIndex * 2 + 2)
                  .map((answer) => (
                    <div key={answer.questionId} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Câu {answer.questionNumber}</h4>
                        <div className="flex items-center gap-2">
                          {getAnswerIcon(answer.isCorrect)}
                          {getAnswerBadge(answer.isCorrect)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <span className="text-sm text-muted-foreground">Câu trả lời của bạn:</span>
                          <div className="font-medium">
                            {answer.userAnswer || (
                              <span className="text-muted-foreground italic">Chưa trả lời</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Đáp án đúng:</span>
                          <div className="font-medium text-green-600">{answer.correctAnswer}</div>
                        </div>
                      </div>
                      <span
                        className={`text-sm hover:underline cursor-pointer text-blue-600 ${loadingExplainId === answer.questionId ? 'pointer-events-none opacity-60' : ''
                          }`}
                        onClick={() => handleShowExplanation(answer.questionId, answer.userAnswer)}
                      >
                        {loadingExplainId === answer.questionId ? 'Đang tải...' : 'Xem giải thích'}
                      </span>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button onClick={() => router.push('/')} variant="outline">
          <Home className="h-4 w-4 mr-2" />
          Về trang chủ
        </Button>
        <Button onClick={() => router.push('/practice-tests')}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Tiếp tục luyện tập
        </Button>
      </div>
      <AnswerExplanationModal
        open={showModal}
        onClose={handleCloseModal}
        data={selectedQuestion}
        userAnswer={selectedUserAnswer}
      />

    </div>

  );
}
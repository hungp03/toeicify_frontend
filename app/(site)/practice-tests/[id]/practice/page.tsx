'use client';


import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { FileText, Image, Volume2, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getQuestionsByExamId } from '@/lib/api/question';


interface Option {
  optionId: number;
  optionText: string;
  optionLetter: string;
}

interface Question {
  groupId: number;
  questionId: number;
  questionText: string;
  questionType: string;
  correctAnswerOption: string;
  explanation: string;
  options: Option[];
}

interface QuestionGroup {
  partId: number;
  groupId: number;
  audioUrl?: string;
  imageUrl?: string;
  partName: string;
  passageText?: string;
  questions: Question[];
}

interface ExamPart {
  partId: number;
  partName: string;
  partNumber: number;
  description: string;
  questionCount: number;
  questionGroups: QuestionGroup[];
}

interface ExamData {
  examId: number;
  status: string;
  examName: string;
  createdAt: string | null;
  examDescription?: string;
  totalQuestions?: number;
  categoryName?: string;
  examParts: ExamPart[];
}

interface CustomQuestion extends Question {
  id: number;
  partId?: number;
  groupId: number;
  partNumber?: number;
  audioUrl?: string;
  imageUrl?: string;
  passageText?: string;
  displayId: number; // For UI numbering
}

const TestPage = () => {
  const { id } = useParams() as { id: string };
  const testId = id;
  const searchParams = useSearchParams();
  const partsParam = searchParams.get('parts') || 'all';
  const timeParam = searchParams.get('time');
  const customTime = timeParam && timeParam !== 'unlimited' ? parseInt(timeParam) : null;
  const isUnlimited = timeParam === 'unlimited';
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, Record<number, string>>>({}); // Store answers by partId
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(1800); // Default 30 minutes
  const [initialTime, setInitialTime] = useState<number>(1800);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0); // Separate timer for actual time spent

  // Initialize time
  useEffect(() => {
    let calculatedTime = 1800; // Default 30 minutes (in seconds)
    if (isUnlimited) {
      calculatedTime = 0;
    } else if (customTime && !isNaN(customTime)) {
      calculatedTime = customTime * 60; // Convert minutes to seconds
    }
    setTimeLeft(calculatedTime);
    setInitialTime(calculatedTime);
  }, [customTime, isUnlimited]);

  // Countdown timer for time limit
  useEffect(() => {
    if (showResults || isUnlimited || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setShowResults(true);
          toast.info('Hết thời gian! Bài thi đã được nộp.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showResults, isUnlimited, timeLeft]);

  // Separate timer for elapsed time
  useEffect(() => {
    if (showResults || showConfirmDialog || !examData) return;

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showResults, showConfirmDialog, examData]);

  // Fetch exam data
  useEffect(() => {
    const fetchExamData = async () => {
      if (!testId || isNaN(parseInt(testId)) || !Number.isInteger(parseInt(testId)) || parseInt(testId) <= 0) {
        setError('Mã đề thi không hợp lệ. Vui lòng kiểm tra lại đường dẫn.');
        setLoading(false);
        toast.error('Mã đề thi không hợp lệ');
        return;
      }

      try {
        setLoading(true);
        const response = await getQuestionsByExamId(parseInt(testId));
        const data = response?.data || null;
        if (!data || !data.examParts || data.examParts.length === 0) {
          throw new Error('Không có dữ liệu đề thi hoặc không có phần thi nào');
        }
        setExamData({
          ...data,
          examDescription: data.examDescription || 'TOEIC Practice Test',
          totalQuestions: data.totalQuestions || 200,
          categoryName: data.categoryName || 'TOEIC',
          examParts: data.examParts.map((part: ExamPart) => ({
            ...part,
            description: part.description || `Part ${part.partNumber}`,
            questionCount: part.questionCount || 0,
            questionGroups: part.questionGroups || [],
          })),
        });
        const partIds = (partsParam === 'all'
          ? data.examParts.map((p: ExamPart) => p.partId)
          : partsParam
              .split(',')
              .map(Number)
              .filter((id) => !isNaN(id))
        ).sort((a: number, b: number) => {
          const partA = data.examParts.find((p: ExamPart) => p.partId === a);
          const partB = data.examParts.find((p: ExamPart) => p.partId === b);
          return (partA?.partNumber || 0) - (partB?.partNumber || 0);
        });
        if (partIds.length > 0) {
          setSelectedPartId(partIds[0]);
        } else {
          setError('Không có phần thi nào được chọn');
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải dữ liệu đề thi');
        console.error('Error fetching exam:', err);
        toast.error(err.message || 'Không thể tải dữ liệu đề thi');
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [testId, partsParam]);

  const formatTime = (s: number) => {
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (isUnlimited) return 'text-blue-600';
    if (timeLeft <= 300) return 'text-red-600'; // 5 minutes left
    if (timeLeft <= 600) return 'text-orange-600'; // 10 minutes left
    return 'text-gray-900';
  };

  const getTimeBackground = () => {
    if (isUnlimited) return 'bg-blue-50';
    if (timeLeft <= 300) return 'bg-red-50';
    if (timeLeft <= 600) return 'bg-orange-50';
    return 'bg-gray-50';
  };

  const getQuestionsForPart = (exam: ExamData, partId: number): CustomQuestion[] => {
    const questions: CustomQuestion[] = [];
    const part = exam.examParts.find((p) => p.partId === partId);
    if (!part) return [];

    // Sort parts by partNumber to ensure correct order
    const sortedParts = [...exam.examParts].sort((a, b) => a.partNumber - b.partNumber);
    
    // Calculate starting displayId based on questions in previous parts
    let displayIndex = 1; // Start at 1 for the first part
    for (const p of sortedParts) {
      if (p.partNumber < part.partNumber) {
        displayIndex += p.questionCount || 0;
      } else {
        break;
      }
    }

    part?.questionGroups?.forEach((group) => {
      group.questions.forEach((q) => {
        questions.push({
          questionId: q.questionId,
          id: q.questionId,
          partId: part.partId,
          groupId: group.groupId,
          partNumber: part.partNumber,
          questionText: q.questionText || '',
          questionType: q.questionType || 'MULTIPLE_CHOICE',
          correctAnswerOption: q.correctAnswerOption || '',
          explanation: q.explanation || '',
          options: q.options.map((opt) => ({
            optionId: opt.optionId,
            optionLetter: opt.optionLetter || '',
            optionText: opt.optionText || '',
            text: opt.optionText || '',
          })),
          audioUrl: group.audioUrl,
          imageUrl: group.imageUrl,
          passageText: group.passageText,
          displayId: displayIndex++,
        });
      });
    });

    // Sort questions by questionId for consistent order within the part
    questions.sort((a, b) => a.questionId - b.questionId);

    // Check for duplicate IDs
    const idSet = new Set(questions.map((q) => q.id));
    if (idSet.size !== questions.length) {
      console.warn('Duplicate question IDs detected:', questions.map((q) => q.id));
    }
    return questions;
  };

  const partIds = examData && partsParam !== 'all'
    ? partsParam.split(',').map(Number).filter((id) => !isNaN(id) && examData.examParts.some((p) => p.partId === id))
    : examData?.examParts.map((p) => p.partId) || [];

  const testData = useMemo(() => {
    if (!examData || !selectedPartId) {
      return { id: testId, title: 'Loading...', questions: [] };
    }
    return {
      id: testId,
      title: `TOEIC Practice Test - Part ${examData.examParts.find((p) => p.partId === selectedPartId)?.partNumber || 'Unknown'}`,
      questions: getQuestionsForPart(examData, selectedPartId),
    };
  }, [examData, selectedPartId, testId]);

  const handlePartSelect = (partId: number) => {
    setSelectedPartId(partId);
    setShowResults(false);
    setShowConfirmDialog(false);
  };

  const handleAnswerChange = (questionId: number, val: string) => {
    if (!selectedPartId) return;
    setAnswers((prev) => ({
      ...prev,
      [selectedPartId]: {
        ...(prev[selectedPartId] || {}),
        [questionId]: val,
      },
    }));
  };

  const handleSubmitTest = () => {
    setShowConfirmDialog(true);
  };

  const confirmSubmit = () => {
    setShowConfirmDialog(false);
    setShowResults(true);
    toast.info('Bài thi đã được nộp.');
  };

  const cancelSubmit = () => {
    setShowConfirmDialog(false);
  };

  const calculateScore = () => {
    if (!examData) return { score: 0, correct: 0, total: 0, answered: 0 };

    let correct = 0;
    let total = 0;
    let answered = 0;

    // Count answered questions
    Object.values(answers).forEach((partAnswers) => {
      answered += Object.keys(partAnswers).length;
    });

    // Iterate through selected parts only for correct answers and total questions
    partIds.forEach((partId) => {
      const part = examData.examParts.find((p) => p.partId === partId);
      if (part) {
        const questions = getQuestionsForPart(examData, part.partId);
        total += questions.length;
        questions.forEach((q) => {
          if (answers[part.partId]?.[q.id] === q.correctAnswerOption) {
            correct++;
          }
        });
      }
    });

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { score, correct, total, answered };
  };

  const getPartName = (partNumber: string) => ({
    '1': 'Photographs',
    '2': 'Question-Response',
    '3': 'Conversations',
    '4': 'Talks',
    '5': 'Incomplete Sentences',
    '6': 'Text Completion',
    '7': 'Reading Comprehension',
  }[partNumber] || `Part ${partNumber}`);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Đang tải đề thi...</p>
      </div>
    );
  }

  if (error || !examData || partIds.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy đề thi</h1>
        <p>{error || 'Không thể tải dữ liệu đề thi hoặc không có phần thi nào.'}</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
          Thử lại
        </Button>
      </div>
    );
  }

  if (!selectedPartId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">{examData.examName} - Chọn phần thi</CardTitle>
            <CardDescription>Chọn một phần thi để bắt đầu làm bài.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {partIds.map((partId) => {
                const part = examData.examParts.find((p) => p.partId === partId);
                return part ? (
                  <Button
                    key={part.partId}
                    variant="outline"
                    className="h-12 text-left justify-start"
                    onClick={() => handlePartSelect(part.partId)}
                  >
                    Part {part.partNumber}: {part.description} ({part.questionCount} câu)
                  </Button>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestions = testData.questions;
  if (!currentQuestions.length) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy câu hỏi</h1>
        <p>Không có câu hỏi nào cho phần thi này.</p>
        <Button variant="outline" onClick={() => setSelectedPartId(null)} className="mt-4">
          Quay lại chọn phần
        </Button>
      </div>
    );
  }

  if (showResults) {
    const { score, correct, total, answered } = calculateScore();
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Hoàn thành bài thi!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{score}%</div>
              <p className="text-gray-600">
                Bạn trả lời đúng {correct} / {total} câu hỏi
              </p>
              <p className="text-gray-600">
                Bạn đã trả lời {answered} / {total} câu hỏi
              </p>
              <p className="text-gray-600">
                Thời gian làm bài: {formatTime(elapsedTime)}
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => {
                  setAnswers({}); // Clear all answers for retry
                  setShowResults(false);
                  setTimeLeft(initialTime); // Reset time for retry
                  setElapsedTime(0); // Reset elapsed time for retry
                  // setSelectedPartId(null);
                  const sortedParts = [...(examData?.examParts || [])].sort(
                    (a, b) => a.partNumber - b.partNumber
                  );
                  const firstPartId = sortedParts[0]?.partId || null;
                  setSelectedPartId(firstPartId);
                }}
              >
                Thi lại
              </Button>
              <Button variant="outline" >
                Xem kết quả
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showConfirmDialog) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">Xác nhận nộp bài</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">Bạn có chắc chắn muốn nộp bài?</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={confirmSubmit}>Xác nhận</Button>
              <Button variant="outline" onClick={cancelSubmit}>Hủy</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const part = examData.examParts.find((p) => p.partId === selectedPartId);
  const isListeningPartWithoutText = part?.partNumber === 1 || part?.partNumber === 2;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{testData.title}</h1>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${getTimeBackground()}`}>
            <Clock className={`h-4 w-4 ${getTimeColor()}`} />
            <div className="flex flex-col items-center">
              <span className={`font-mono text-lg font-semibold ${getTimeColor()}`}>
                {isUnlimited ? 'Không giới hạn' : formatTime(timeLeft)}
              </span>
              {!isUnlimited && (
                <span className="text-xs text-gray-500">
                  {timeLeft <= 300 ? 'Nhanh lên!' : timeLeft <= 600 ? 'Sắp hết giờ' : 'Thời gian còn lại'}
                </span>
              )}
            </div>
            {!isUnlimited && timeLeft <= 300 && (
              <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
            )}
          </div>
          <Button variant="outline" onClick={handleSubmitTest}>
            Nộp bài
          </Button>
        </div>
      </div>

      {!isUnlimited && initialTime > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Tiến độ thời gian</span>
            <span>{Math.round(((initialTime - timeLeft) / initialTime) * 100)}% đã trôi qua</span>
          </div>
          <Progress value={((initialTime - timeLeft) / initialTime) * 100} className="w-full h-2" />
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Chọn phần thi:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {partIds.map((partId) => {
            const part = examData.examParts.find((p) => p.partId === partId);
            return part ? (
              <Button
                key={part.partId}
                variant={selectedPartId === part.partId ? 'default' : 'outline'}
                className="h-12 text-left justify-start"
                onClick={() => handlePartSelect(part.partId)}
              >
                Part {part.partNumber}: {part.description} ({part.questionCount} câu)
              </Button>
            ) : null;
          })}
        </div>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Tổng số câu hỏi: {currentQuestions.length}</span>
          <span>Part {part?.partNumber}: {getPartName(String(part?.partNumber))}</span>
        </div>
        <Progress
          value={
            (selectedPartId && answers[selectedPartId]
              ? Object.keys(answers[selectedPartId]).length
              : 0) / currentQuestions.length * 100
          }
          className="w-full"
        />
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 space-y-8">
          {part?.questionGroups?.map((group) => (
            <div key={group.groupId} className="space-y-6">
              {group.audioUrl && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Volume2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Câu hỏi nghe - Part {part.partNumber}</span>
                  </div>
                  <audio controls className="w-full">
                    <source src={group.audioUrl} type="audio/mpeg" />
                    Trình duyệt của bạn không hỗ trợ phần tử âm thanh.
                  </audio>
                </div>
              )}

              {group.imageUrl && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Image className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Part {part.partNumber}: {getPartName(String(part?.partNumber))}</span>
                  </div>
                  <img src={group.imageUrl} alt="Group image" className="max-w-full h-64 object-cover rounded-lg mx-auto" />
                </div>
              )}

              {/* {group.passageText && !isListeningPartWithoutText && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Part {part.partNumber}: {getPartName(String(part?.partNumber))}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{group.passageText}</p>
                </div>
              )} */}

              {group.questions.map((q, index) => {
                const question = currentQuestions.find((cq) => cq.questionId === q.questionId && cq.groupId === group.groupId);
                if (!question) {
                  console.warn(`No matching question found for questionId: ${q.questionId}, groupId: ${group.groupId}`);
                  return null;
                }
                return (
                  <div key={question.id} className="space-y-4 border-b pb-6 last:border-b-0">
                    {!isListeningPartWithoutText && (
                      <h3 className="text-lg font-semibold">
                        Câu {question.displayId}: {question.questionText || '(No question text provided)'}
                      </h3>
                    )}
                    {isListeningPartWithoutText && (
                      <h3 className="text-lg font-semibold">Câu {question.displayId}</h3>
                    )}
                    <RadioGroup
                      value={selectedPartId && answers[selectedPartId]?.[question.id] || ''}
                      onValueChange={(val) => handleAnswerChange(question.id, val)}
                      className="space-y-3"
                    >
                      {question.options.map((option) => (
                        <div key={option.optionId} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={option.optionLetter}
                            id={`option-${question.id}-${option.optionId}`}
                          />
                          <Label
                            htmlFor={`option-${question.id}-${option.optionId}`}
                            className="cursor-pointer"
                          >
                            {isListeningPartWithoutText ? option.optionLetter : (option.optionText || '(No option text)')}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                );
              })}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestPage;

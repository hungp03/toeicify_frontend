'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { FileText, Image, Volume2, AlertCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getQuestionsByExamId } from '@/lib/api/question';
import { ExamData, Question } from '@/types/exam';

const TestPage = () => {
  const { id } = useParams() as { id: string };
  const testId = id;
  const searchParams = useSearchParams();
  const partsParam = searchParams.get('parts') || 'all';
  const customTime = searchParams.get('time') && searchParams.get('time') !== 'unlimited' 
    ? parseInt(searchParams.get('time')) : null;
  const isUnlimited = searchParams.get('time') === 'unlimited';
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(1800); // Default 30 minutes
  const [initialTime, setInitialTime] = useState<number>(1800);

  // Khởi tạo thời gian
  useEffect(() => {
    let calculatedTime = 1800; // Default 30 minutes (in seconds)
    if (isUnlimited) {
      calculatedTime = 0;
    } else if (customTime && !isNaN(customTime)) {
      calculatedTime = customTime * 60; // Convert minutes to seconds
    }
    setTimeLeft(calculatedTime);
    setInitialTime(calculatedTime);
  }, [customTime, isUnlimited, selectedPartId]); // Reset time when changing part

  // Countdown timer
  useEffect(() => {
    if (showResults || isUnlimited || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
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
          examParts: data.examParts.map(part => ({
            ...part,
            description: part.description || `Part ${part.partNumber}`,
            questionCount: part.questionCount || 0,
            questionGroups: part.questionGroups || [],
          })),
        });
        const partIds = partsParam === 'all' ? data.examParts.map(p => p.partId) : partsParam.split(',').map(Number).filter(id => !isNaN(id));
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
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
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

  const getQuestionsForPart = (exam: ExamData, partId: number): Question[] => {
    const questionRanges = [
      { part: 1, start: 1, count: 6 },
      { part: 2, start: 7, count: 25 },
      { part: 3, start: 32, count: 39 },
      { part: 4, start: 71, count: 30 },
      { part: 5, start: 101, count: 30 },
      { part: 6, start: 131, count: 16 },
      { part: 7, start: 147, count: 54 },
    ];

    const questions: Question[] = [];
    const part = exam.examParts.find(p => p.partId === partId);
    if (!part) return [];

    const range = questionRanges.find(r => r.part === parseInt(part.partNumber));
    let questionIndex = range ? range.start : 1;

    part.questionGroups.forEach(group => {
      group.questions.forEach(q => {
        questions.push({
          id: questionIndex++,
          partId: part.partId,
          groupId: group.groupId,
          partNumber: part.partNumber,
          questionText: q.questionText || '',
          questionType: q.questionType || 'MULTIPLE_CHOICE',
          correctAnswer: q.correctAnswerOption || '',
          explanation: q.explanation || '',
          options: q.options.map(opt => ({
            id: opt.optionId,
            letter: opt.optionLetter || '',
            text: opt.optionText || '',
          })),
          audioUrl: group.audioUrl,
          imageUrl: group.imageUrl,
          passageText: group.passageText,
        });
      });
    });

    return questions;
  };

  const partIds = examData && partsParam !== 'all' 
    ? partsParam.split(',').map(Number).filter(id => !isNaN(id) && examData.examParts.some(p => p.partId === id))
    : examData?.examParts.map(p => p.partId) || [];

  const testData = examData && selectedPartId
    ? {
        id: testId,
        title: `TOEIC Practice Test - Part ${examData.examParts.find(p => p.partId === selectedPartId)?.partNumber || 'Unknown'}`,
        questions: getQuestionsForPart(examData, selectedPartId),
      }
    : { id: testId, title: 'Loading...', questions: [] };

  const handlePartSelect = (partId: number) => {
    setSelectedPartId(partId);
    setAnswers({});
    setShowResults(false);
  };

  const handleAnswerChange = (questionId: number, val: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: val }));
  };

  const handleSubmitTest = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    testData.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return Math.round((correct / testData.questions.length) * 100);
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
              {partIds.map(partId => {
                const part = examData.examParts.find(p => p.partId === partId);
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
    const score = calculateScore();
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Hoàn thành phần thi!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{score}%</div>
              <p className="text-gray-600">
                Bạn trả lời đúng {currentQuestions.filter(q => answers[q.id] === q.correctAnswer).length} /{' '}
                {currentQuestions.length} câu hỏi
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => {
                setAnswers({});
                setShowResults(false);
                setTimeLeft(initialTime); // Reset time for retry
              }}>
                Thử lại
              </Button>
              <Button variant="outline" onClick={() => setSelectedPartId(null)}>
                Quay lại chọn phần
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const part = examData.examParts.find(p => p.partId === selectedPartId);

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
          <Progress 
            value={((initialTime - timeLeft) / initialTime) * 100} 
            className="w-full h-2"
          />
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Chọn phần thi:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {partIds.map(partId => {
            const part = examData.examParts.find(p => p.partId === partId);
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
          <span>Part {part?.partNumber}: {getPartName(part?.partNumber || '')}</span>
        </div>
        <Progress value={(Object.keys(answers).length / currentQuestions.length) * 100} className="w-full" />
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 space-y-8">
          {part?.questionGroups.map(group => (
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
                    <span className="text-sm font-medium">Part {part.partNumber}: {getPartName(part.partNumber)}</span>
                  </div>
                  <img src={group.imageUrl} alt="Group image" className="max-w-full h-64 object-cover rounded-lg mx-auto" />
                </div>
              )}

              {group.passageText && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Part {part.partNumber}: {getPartName(part.partNumber)}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{group.passageText}</p>
                </div>
              )}

              {group.questions.map((q, index) => {
                const question = currentQuestions.find(cq => cq.groupId === group.groupId && cq.questionText === q.questionText);
                if (!question) return null;
                return (
                  <div key={question.id} className="space-y-4 border-b pb-6 last:border-b-0">
                    <h3 className="text-lg font-semibold">Câu {question.id}: {question.questionText}</h3>
                    <RadioGroup
                      value={answers[question.id] || ''}
                      onValueChange={(val) => handleAnswerChange(question.id, val)}
                      className="space-y-3"
                    >
                      {question.options.map(option => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.letter} id={`option-${question.id}-${option.id}`} />
                          <Label htmlFor={`option-${question.id}-${option.id}`} className="cursor-pointer">
                            {option.letter}. {option.text}
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
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ArrowLeft, Loader2, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { getPublicExamById } from '@/lib/api/exam';
import { ExamData } from '@/types/exam';

const TestSetup = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParts, setSelectedParts] = useState<number[]>([]);
  const [useFullTest, setUseFullTest] = useState(false);
  const [customTime, setCustomTime] = useState<string>('');
  const [invalidId, setInvalidId] = useState(false);

  useEffect(() => {
    const validateAndFetchExam = async () => {
      if (!id || isNaN(Number(id)) || !Number.isInteger(Number(id)) || Number(id) <= 0) {
        setInvalidId(true);
        setLoading(false);
        toast.error('Mã đề thi không hợp lệ. Vui lòng kiểm tra lại đường dẫn.');
        return;
      }

      try {
        setLoading(true);
        setInvalidId(false);

        const response = await getPublicExamById(parseInt(id));
        if (response?.data && response.data.status === "PUBLIC") {
          const sortedExam = {
            ...response.data,
            examParts: [...response.data.examParts].sort(
              (a, b) => a.partNumber - b.partNumber
            ),
          };
          setExamData(sortedExam);
        } else {
          setExamData(null);
        }
      } catch (err: any) {
        setError("Mã đề thi không hợp lệ hoặc không tồn tại. Vui lòng kiểm tra lại.");
        console.error("Error fetching exam:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      validateAndFetchExam();
    }
  }, [id]);

  const handlePartToggle = (partId: number) => {
    setSelectedParts(prev =>
      prev.includes(partId) ? prev.filter(id => id !== partId) : [...prev, partId]
    );
    setUseFullTest(false);
  };

  const handleFullTestToggle = () => {
    setUseFullTest(!useFullTest);
    if (!useFullTest) {
      setSelectedParts([]);
      setCustomTime(''); // Clear custom time when switching to full test
    }
  };

  const getTotalQuestions = () => {
    if (!examData) return 0;
    if (useFullTest) return examData.totalQuestions;

    return selectedParts.reduce((total, partId) => {
      const part = examData.examParts.find(p => p.partId === partId);
      return total + (part?.questionCount || 0);
    }, 0);
  };

  const handleStartTest = () => {
    if (!examData) return;

    const partsParam = useFullTest ? 'all' : selectedParts.join(',');
    const timeParam = customTime ? customTime : 'unlimited';
    router.push(`/practice-tests/${id}/practice?parts=${partsParam}&time=${timeParam}`);
  };

  const canStartTest = useFullTest || selectedParts.length > 0;

  // Invalid ID state
  if (invalidId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/practice-tests')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách đề
            </Button>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-600 mb-2">Mã đề thi không hợp lệ</h3>
                <p className="text-gray-600 mb-4">
                  Mã đề thi không hợp lệ. Vui lòng kiểm tra lại đường dẫn.
                </p>
                <Button onClick={() => router.push('/practice-tests')}>
                  Quay lại danh sách đề thi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Đang tải thông tin đề thi...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !examData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/practice-tests')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách đề
            </Button>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-600 mb-2">Mã đề thi không hợp lệ</h3>
                <p className="text-red-600 mb-4">{error || 'Không thể tải thông tin đề thi'}</p>
                <Button onClick={() => router.push('/practice-tests')}>
                  Quay lại danh sách đề thi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/practice-tests')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách đề
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{examData.examName}</CardTitle>
            <CardDescription>
              {examData.examDescription}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="p-4 rounded-lg">
              <Badge className="mb-2 ml-2 bg-amber-500">{examData.totalQuestions} câu</Badge>
              <Badge className="mb-2 ml-2 bg-emerald-600">#{examData.categoryName}</Badge>
              <Badge className="mb-2 ml-2 bg-blue-600">{examData.examParts.length} phần thi</Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="full-test"
                  checked={useFullTest}
                  onCheckedChange={handleFullTestToggle}
                />
                <Label htmlFor="full-test" className="text-lg font-semibold">
                  Làm toàn bộ đề ({examData.totalQuestions} câu)
                </Label>
              </div>

              {useFullTest && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">
                      Thời gian làm bài: 120 phút
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Hoặc chọn từng phần:</h3>
              <div className="grid gap-3">
                {examData.examParts.map((part) => (
                  <div key={part.partId} className="flex items-center p-3 border rounded-lg space-x-3">
                    <Checkbox
                      id={`part-${part.partId}`}
                      checked={selectedParts.includes(part.partId)}
                      onCheckedChange={() => handlePartToggle(part.partId)}
                      disabled={useFullTest}
                    />
                    <Label htmlFor={`part-${part.partId}`} className="cursor-pointer w-full">
                      <div className="flex justify-between items-center w-full">
                        <span>Part {part.partNumber}: {part.description}</span>
                        <span className="text-sm text-gray-500 whitespace-nowrap">{part.questionCount} câu</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Thời gian làm bài - Only show for partial tests */}
            {!useFullTest && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Thời gian làm bài (phút)</h3>
                <div className="flex gap-4 items-center flex-wrap">
                  <Select onValueChange={(value) => setCustomTime(value)} value={customTime}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Chọn nhanh" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(24)].map((_, i) => {
                        const val = (i + 1) * 5;
                        return (
                          <SelectItem key={val} value={val.toString()}>
                            {val} phút
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-500 italic">
                    Để trống nếu không giới hạn thời gian
                  </span>
                </div>
              </div>
            )}

            {/* Tổng kết */}
            {canStartTest && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Tóm tắt lựa chọn:</h4>
                <div className="space-y-1 text-sm">
                  <p>Số câu hỏi đã chọn: {getTotalQuestions()}</p>
                  <p>
                    Thời gian:{" "}
                    {useFullTest
                      ? "120 phút (cố định)"
                      : customTime
                        ? `${customTime} phút`
                        : "Không giới hạn"}
                  </p>
                  {!useFullTest && selectedParts.length > 0 && (
                    <p>
                      Phần đã chọn: {selectedParts.map(partId => {
                        const part = examData.examParts.find(p => p.partId === partId);
                        return part ? `Part ${part.partNumber}` : '';
                      }).filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Bắt đầu */}
            <Button
              onClick={handleStartTest}
              disabled={!canStartTest}
              className="w-full"
              size="lg"
            >
              Bắt đầu làm bài
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestSetup;
'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

const parts = [
  { id: 1, name: 'Part 1: Photographs', questions: 6 },
  { id: 2, name: 'Part 2: Question-Response', questions: 25 },
  { id: 3, name: 'Part 3: Conversations', questions: 39 },
  { id: 4, name: 'Part 4: Talks', questions: 30 },
  { id: 5, name: 'Part 5: Incomplete Sentences', questions: 30 },
  { id: 6, name: 'Part 6: Text Completion', questions: 16 },
  { id: 7, name: 'Part 7: Reading Comprehension', questions: 54 },
];

const TestSetup = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [selectedParts, setSelectedParts] = useState<number[]>([]);
  const [useFullTest, setUseFullTest] = useState(false);
  const [customTime, setCustomTime] = useState<string>('');

  const handlePartToggle = (partId: number) => {
    setSelectedParts(prev =>
      prev.includes(partId) ? prev.filter(id => id !== partId) : [...prev, partId]
    );
    setUseFullTest(false);
  };

  const handleFullTestToggle = () => {
    setUseFullTest(!useFullTest);
    if (!useFullTest) setSelectedParts([]);
  };

  const getTotalQuestions = () => {
    if (useFullTest) return 200;
    return selectedParts.reduce((total, partId) => {
      const part = parts.find(p => p.id === partId);
      return total + (part?.questions || 0);
    }, 0);
  };

  const handleStartTest = () => {
    const partsParam = useFullTest ? 'all' : selectedParts.join(',');
    const timeParam = customTime ? customTime : 'unlimited';
    router.push(`/practice-tests/${id}/practice?parts=${partsParam}&time=${timeParam}`);
  };

  const canStartTest = useFullTest || selectedParts.length > 0;

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
            <CardTitle className="text-2xl">Thiết lập bài kiểm tra</CardTitle>
            <CardDescription>
              Chọn các phần và thời gian làm bài trước khi bắt đầu.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Chọn Full test */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="full-test"
                  checked={useFullTest}
                  onCheckedChange={handleFullTestToggle}
                />
                <Label htmlFor="full-test" className="text-lg font-semibold">
                  Làm toàn bộ đề (200 câu)
                </Label>
              </div>
            </div>

            {/* Chọn phần */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Hoặc chọn từng phần:</h3>
              <div className="grid gap-3">
                {parts.map((part) => (
                  <div key={part.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox
                      id={`part-${part.id}`}
                      checked={selectedParts.includes(part.id)}
                      onCheckedChange={() => handlePartToggle(part.id)}
                      disabled={useFullTest}
                    />
                    <Label htmlFor={`part-${part.id}`} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span>{part.name}</span>
                        <span className="text-sm text-gray-500">{part.questions} câu</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Thời gian làm bài */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Thời gian làm bài (phút)</h3>
              <div className="flex gap-4 items-center flex-wrap">
                <Select onValueChange={(value) => setCustomTime(value)}>
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
                <Input
                  type="number"
                  placeholder="Hoặc nhập tay"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  min={1}
                  max={300}
                  className="w-40"
                />
                <span className="text-sm text-gray-500 italic">
                  Để trống nếu không giới hạn thời gian
                </span>
              </div>
            </div>

            {/* Tổng kết */}
            {canStartTest && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Tóm tắt:</h4>
                <div className="space-y-1 text-sm">
                  <p>Tổng số câu hỏi: {getTotalQuestions()}</p>
                  <p>
                    Thời gian:{" "}
                    {customTime
                      ? `${customTime} phút`
                      : "Không giới hạn"}
                  </p>
                  {!useFullTest && selectedParts.length > 0 && (
                    <p>Phần đã chọn: {selectedParts.join(', ')}</p>
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

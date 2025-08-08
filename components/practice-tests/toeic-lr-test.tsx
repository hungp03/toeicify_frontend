'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Clock, Image as Flag, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { PartData } from '@/types/question';

interface Props {
  partData: PartData;
  onPartComplete?: () => void;
  isLastPart?: boolean;
  currentPartIndex?: number;
  totalParts?: number;
  isPaused: boolean;
  remainingTime: number;
  onTimeChange: React.Dispatch<React.SetStateAction<number>>;
  onSubmitTest: () => void;
  initialAnswers: Record<number, string>;
  initialMarkedForReview: Record<number, boolean>;
  onAnswersChange: (answers: Record<number, string>) => void;
  onMarkedForReviewChange: (marked: Record<number, boolean>) => void;
}

const ToeicTest: React.FC<Props> = ({
  partData,
  onPartComplete,
  isLastPart = true,
  currentPartIndex = 1,
  totalParts = 1,
  isPaused,
  remainingTime,
  onTimeChange,
  onSubmitTest,
  initialAnswers,
  initialMarkedForReview,
  onAnswersChange,
  onMarkedForReviewChange
}) => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const allQuestions = partData.groups
    .flatMap(group =>
      group.questions.map(question => ({
        ...question,
        groupId: group.groupId,
        audioUrl: group.audioUrl,
        imageUrl: group.imageUrl,
        passageText: group.passageText
      }))
    )
    .sort((a, b) => a.questionId - b.questionId);

  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>(initialAnswers);
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>(initialMarkedForReview);
  const [hasShownOneMinuteToast, setHasShownOneMinuteToast] = useState(false);
  const currentGroup = partData.groups[currentGroupIndex];

  useEffect(() => {
    if (remainingTime === 60 && !hasShownOneMinuteToast) {
      toast.warning("Chỉ còn 1 phút! Hãy hoàn thành bài thi của bạn.");
      setHasShownOneMinuteToast(true);
    }
  }, [remainingTime, hasShownOneMinuteToast]);

  // Initialize với data từ parent - chỉ chạy khi mount
  useEffect(() => {
    setAnswers(initialAnswers);
    setMarkedForReview(initialMarkedForReview);
    setCurrentGroupIndex(0);
  }, []); // Empty dependency để chỉ chạy khi mount

  // Notify parent khi có thay đổi - sử dụng setTimeout để debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onAnswersChange(answers);
    }, 200);
    return () => clearTimeout(timeoutId);
  }, [answers]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onMarkedForReviewChange(markedForReview);
    }, 200);
    return () => clearTimeout(timeoutId);
  }, [markedForReview]);

  const getPartName = () => {
    if (partData.description) {
      return partData.description;
    }
    switch (partData.partNumber) {
      case 1: return 'Photographs';
      case 2: return 'Question-Response';
      case 3: return 'Conversations';
      case 4: return 'Talks';
      case 5: return 'Incomplete Sentences';
      case 6: return 'Text Completion';
      case 7: return 'Reading Comprehension';
      default: return 'Unknown Part';
    }
  };

  const formatTime = (s: number) => {
    if (s <= 0) return '00:00';
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: number, val: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: val
    }));
  };

  const handleMarkForReview = (questionId: number) => {
    setMarkedForReview(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleNextGroup = () => {
    setCurrentGroupIndex(prev => Math.min(prev + 1, partData.groups.length - 1));
  };

  const handlePreviousGroup = () => {
    setCurrentGroupIndex(prev => Math.max(prev - 1, 0));
  };

  const handleSubmitClick = () => {
    onSubmitTest();
  };

  const handleFinishPart = () => {
    onPartComplete?.();
  };

  if (!currentGroup) {
    return (
      <div className="text-center text-red-500 py-8">
        Không tìm thấy câu hỏi cho phần này. Vui lòng kiểm tra lại dữ liệu hoặc thử làm mới trang.
      </div>
    );
  }

  // Check if current group has an image
  const hasImage = (partData.partNumber === 1 || (partData.partNumber >= 6 && currentGroup.imageUrl)) && currentGroup.imageUrl;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Part {partData.partNumber}: {getPartName()}
        </h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50">
            {remainingTime !== 0 && <><Clock className="h-4 w-4 text-gray-900" />
              <span className="font-mono text-lg font-semibold">
                {formatTime(remainingTime)}
              </span></>}
          </div>
          <Button variant="outline" onClick={handleSubmitClick}>
            Nộp bài
          </Button>
        </div>
      </div>

      {/* Question Navigation Grid */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Danh sách câu hỏi</h3>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span>Đã trả lời</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
              <span>Đánh dấu để xem lại</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Câu hỏi hiện tại</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {partData.groups.map((group, groupIndex) => (
              <div key={group.groupId} className="flex space-x-1 mr-4 mt-4">
                {group.questions.map((q) => {
                  const isAnswered = !!answers[q.questionId];
                  const isMarked = !!markedForReview[q.questionId];
                  const isCurrentGroup = groupIndex === currentGroupIndex;

                  return (
                    <button
                      key={q.questionId}
                      onClick={() => setCurrentGroupIndex(groupIndex)}
                      className={`
                        flex-shrink-0 w-10 h-10 text-xs rounded-lg border-2 font-medium transition-all relative
                        ${isCurrentGroup
                          ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                          : isAnswered && isMarked
                            ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200'
                            : isAnswered
                              ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                              : isMarked
                                ? 'bg-orange-50 text-orange-600 border-orange-300 hover:bg-orange-100'
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      {q.questionNumber}
                      {isMarked && (
                        <Flag className="absolute -top-1 -right-1 h-2 w-2 text-orange-500" />
                      )}
                    </button>
                  );
                })}
                {groupIndex < partData.groups.length - 1 && (
                  <div className="w-px h-10 bg-gray-300 mx-1"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Audio */}
          {(partData.partNumber <= 4) && currentGroup.audioUrl && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <audio
                controls
                className="w-full"
                key={currentGroup.audioUrl}
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
              >
                <source src={currentGroup.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Passage */}
          {(partData.partNumber >= 6) && currentGroup.passageText && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Reading Passage</span>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {currentGroup.passageText}
                </p>
              </div>
            </div>
          )}

          {/* Image and Questions - Responsive Layout */}
          {hasImage ? (
            <div className="flex flex-col md:flex-row md:gap-8">
              {/* Image Section */}
              <div className="mb-6 md:mb-0 w-full md:w-1/2">
                <div className="flex justify-center">
                  <img
                    src={currentGroup.imageUrl}
                    alt={`Group ${currentGroup.groupId} image`}
                    className="max-w-full h-80 md:h-96 lg:h-[500px] object-contain rounded-lg border"
                    loading="lazy"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="w-full md:w-1/2">
                <div className="space-y-8">
                  {currentGroup.questions.map((question) => (
                    <div key={question.questionId} className="border-b border-gray-200 pb-6 last:border-b-0">
                      {partData.partNumber >= 3 && (
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold">
                            {question.questionNumber}.
                            {question.questionText && <span> {question.questionText}</span>}
                          </h3>
                        </div>
                      )}
                      <div className="space-y-3">
                        {!(partData.partNumber >= 3) && currentGroup.questions.length === 1 && (
                          <h3 className="text-lg font-semibold mb-4">
                            {partData.partNumber === 1 ? 'Choose the best description for the picture:' : 'Choose the best response:'}
                          </h3>
                        )}

                        <RadioGroup
                          value={answers[question.questionId] || ''}
                          onValueChange={(val) => handleAnswerChange(question.questionId, val)}
                          className="space-y-2"
                        >
                          {question.options.map((option) => (
                            <div key={option.optionId} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                              <RadioGroupItem
                                value={option.optionLetter}
                                id={`option-${option.optionId}`}
                                className="mt-0.5"
                              />
                              <Label
                                htmlFor={`option-${option.optionId}`}
                                className="cursor-pointer text-base flex-1"
                              >
                                <span className="font-medium text-lg">({option.optionLetter})</span>
                                {(partData.partNumber >= 3) && (
                                  <span className="ml-2">{option.optionText}</span>
                                )}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>

                        <div className="flex justify-end mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkForReview(question.questionId)}
                            className={`${markedForReview[question.questionId] ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200' : 'hover:bg-orange-50'}`}
                          >
                            <Flag className={`h-3 w-3 mr-1 ${markedForReview[question.questionId] ? 'text-orange-500' : ''}`} />
                            {markedForReview[question.questionId] ? 'Marked' : 'Mark'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Questions without image - original layout */
            <div className="space-y-8">
              {currentGroup.questions.map((question) => (
                <div key={question.questionId} className="border-b border-gray-200 pb-6 last:border-b-0">
                  {partData.partNumber >= 3 && question.questionText && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold">
                        {question.questionNumber}. {question.questionText}
                      </h3>
                    </div>
                  )}

                  <div className="space-y-3">
                    {!(partData.partNumber >= 3) && currentGroup.questions.length === 1 && (
                      <h3 className="text-lg font-semibold mb-4">
                        {partData.partNumber === 1 ? 'Choose the best description for the picture:' : 'Choose the best response:'}
                      </h3>
                    )}

                    <RadioGroup
                      value={answers[question.questionId] || ''}
                      onValueChange={(val) => handleAnswerChange(question.questionId, val)}
                      className="space-y-2"
                    >
                      {question.options.map((option) => (
                        <div key={option.optionId} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                          <RadioGroupItem
                            value={option.optionLetter}
                            id={`option-${option.optionId}`}
                            className="mt-0.5"
                          />
                          <Label
                            htmlFor={`option-${option.optionId}`}
                            className="cursor-pointer text-base flex-1"
                          >
                            <span className="font-medium text-lg">({option.optionLetter})</span>
                            {(partData.partNumber >= 3) && (
                              <span className="ml-2">{option.optionText}</span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    <div className="flex justify-end mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkForReview(question.questionId)}
                        className={`${markedForReview[question.questionId] ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200' : 'hover:bg-orange-50'}`}
                      >
                        <Flag className={`h-3 w-3 mr-1 ${markedForReview[question.questionId] ? 'text-orange-500' : ''}`} />
                        {markedForReview[question.questionId] ? 'Marked' : 'Mark'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePreviousGroup}
          disabled={currentGroupIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Trước
        </Button>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleNextGroup}
            disabled={currentGroupIndex === partData.groups.length - 1}
          >
            Tiếp theo
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <Button variant="ghost" onClick={handleFinishPart}>
            {isLastPart ? 'Nộp bài' : 'Chuyển part tiếp theo'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ToeicTest;
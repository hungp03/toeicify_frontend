'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter} from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

import { Clock, Image as Flag, ChevronLeft, ChevronRight, FileText, Loader2 } from 'lucide-react';
import { PartData } from '@/types/question';
import { SubmitExamRequest, ExamSubmissionResponse } from '@/types';
import { submitExam } from '@/lib/api/exam';

const ExamResult = dynamic(() => import('./exam-result'), {
    loading: () => (
        <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
});

const SubmitConfirmDialog = dynamic(() => import('./submit-confirm-dialog'));
const QuestionComponent = dynamic(() => import('./question'));

interface Props {
    partData: PartData;
    onPartComplete?: () => void;
    isLastPart?: boolean;
    currentPartIndex?: number;
    totalParts?: number;
    isPaused: boolean;
    remainingTime: number;
    onTimeChange: React.Dispatch<React.SetStateAction<number>>;
    onSubmitTest?: () => void;
    initialAnswers: Record<number, string>;
    initialMarkedForReview: Record<number, boolean>;
    onAnswersChange: (answers: Record<number, string>) => void;
    onMarkedForReviewChange: (marked: Record<number, boolean>) => void;
    allPartIds?: number[];
    allAnswers?: Record<string, Record<number, string>>;
    examStartTime?: Date;
    isFullExam?: boolean;
    onShowResult?: (showing: boolean) => void;
}

function toUtcNoMsZ(d: Date): string {
    return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

const ToeicTest = React.memo<Props>(({
    partData,
    onPartComplete,
    isLastPart = true,
    totalParts = 1,
    remainingTime,
    onSubmitTest,
    initialAnswers,
    initialMarkedForReview,
    onAnswersChange,
    onMarkedForReviewChange,
    allPartIds = [],
    allAnswers = {},
    examStartTime,
    isFullExam = false,
    onShowResult
}) => {
    const params = useParams();
    const router = useRouter();

    // State management
    const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>(initialAnswers);
    const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>(initialMarkedForReview);
    const [hasShownOneMinuteToast, setHasShownOneMinuteToast] = useState(false);

    // Submission state
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<ExamSubmissionResponse | null>(null);
    const [showResult, setShowResult] = useState(false);

    // Track exam start time - use prop if provided
    const [examStartTimeState] = useState(() => examStartTime || new Date());

    // Memoized values for performance
    const currentGroup = useMemo(() =>
        partData.groups[currentGroupIndex],
        [partData.groups, currentGroupIndex]
    );

    const answeredCount = useMemo(() =>
        Object.keys(answers).length,
        [answers]
    );

    const totalQuestions = useMemo(() =>
        partData.groups.reduce((sum, group) => sum + group.questions.length, 0),
        [partData.groups]
    );

    const hasImage = useMemo(() =>
        (partData.partNumber === 1 || (partData.partNumber >= 6 && currentGroup?.imageUrl)) && currentGroup?.imageUrl,
        [partData.partNumber, currentGroup?.imageUrl]
    );

    // Effects with proper cleanup
    useEffect(() => {
        if (remainingTime === 60 && !hasShownOneMinuteToast) {
            toast.warning("Chỉ còn 1 phút! Hãy hoàn thành bài thi của bạn.");
            setHasShownOneMinuteToast(true);
        }
    }, [remainingTime, hasShownOneMinuteToast]);

    useEffect(() => {
        setAnswers(initialAnswers);
        setMarkedForReview(initialMarkedForReview);
        setCurrentGroupIndex(0);
    }, [initialAnswers, initialMarkedForReview]);

    // Debounced effects for better performance
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onAnswersChange(answers);
        }, 200);
        return () => clearTimeout(timeoutId);
    }, [answers, onAnswersChange]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onMarkedForReviewChange(markedForReview);
        }, 200);
        return () => clearTimeout(timeoutId);
    }, [markedForReview, onMarkedForReviewChange]);

    // Handlers with useCallback for optimization
    const getPartName = useCallback(() => {
        if (partData.description) {
            return partData.description;
        }
        const partNames: Record<number, string> = {
            1: 'Photographs',
            2: 'Question-Response',
            3: 'Conversations',
            4: 'Talks',
            5: 'Incomplete Sentences',
            6: 'Text Completion',
            7: 'Reading Comprehension'
        };
        return partNames[partData.partNumber] || 'Unknown Part';
    }, [partData.description, partData.partNumber]);

    const formatTime = useCallback((s: number) => {
        if (s <= 0) return '00:00';
        const minutes = Math.floor(s / 60);
        const seconds = s % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, []);

    const handleAnswerChange = useCallback((questionId: number, val: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: val
        }));
    }, []);

    const handleMarkForReview = useCallback((questionId: number) => {
        setMarkedForReview(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    }, []);

    const handleNextGroup = useCallback(() => {
        setCurrentGroupIndex(prev => Math.min(prev + 1, partData.groups.length - 1));
    }, [partData.groups.length]);

    const handlePreviousGroup = useCallback(() => {
        setCurrentGroupIndex(prev => Math.max(prev - 1, 0));
    }, []);

    const handleSubmitExam = useCallback(async (): Promise<ExamSubmissionResponse | null> => {
        setIsSubmitting(true);

        try {
            // Enhanced logic for determining full test
            const isFullTest = isFullExam || (totalParts > 1 && allPartIds.length > 1);

            let finalAnswers: Array<{ questionId: number, selectedOption: string }> = [];
            let finalPartIds: number[] = [];

            if (isFullTest) {
                // Full test: submit all partIds from allPartIds
                finalPartIds = allPartIds;

                // Collect answers from all parts
                if (allAnswers && Object.keys(allAnswers).length > 0) {
                    Object.values(allAnswers).forEach(partAnswers => {
                        Object.entries(partAnswers).forEach(([questionId, selectedOption]) => {
                            finalAnswers.push({
                                questionId: parseInt(questionId, 10),
                                selectedOption
                            });
                        });
                    });
                }

                // Add current part answers if not already included
                Object.entries(answers).forEach(([questionId, selectedOption]) => {
                    const questionIdNum = parseInt(questionId, 10);
                    const alreadyIncluded = finalAnswers.some(a => a.questionId === questionIdNum);
                    if (!alreadyIncluded) {
                        finalAnswers.push({
                            questionId: questionIdNum,
                            selectedOption
                        });
                    }
                });
            } else {
                // Partial test: only current part
                finalPartIds = [Number(partData.partId)];
                finalAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
                    questionId: parseInt(questionId, 10),
                    selectedOption
                }));

                if (finalAnswers.length === 0) {
                    toast.error('Vui lòng trả lời ít nhất một câu hỏi');
                    return null;
                }
            }

            const request: SubmitExamRequest = {
                examId: Number(params.id),
                submitType: isFullTest ? 'full' : 'partial',
                partIds: finalPartIds,
                startTime: toUtcNoMsZ(examStartTimeState),
                endTime: toUtcNoMsZ(new Date()),
                answers: finalAnswers
            };

            const response = await submitExam(request);
            const result = response.data;
            setSubmissionResult(result);
            toast.success('Nộp bài thành công!');

            return result;

        } catch (error: any) {
            console.error('Error submitting exam:', error);

            // Enhanced error handling
            let errorMessage = 'Có lỗi xảy ra khi nộp bài';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
            return null;
        } finally {
            setIsSubmitting(false);
        }
    }, [answers, allAnswers, allPartIds, totalParts, isLastPart, isFullExam, params.id, partData.partId, examStartTimeState]);

    const handleSubmitClick = useCallback(() => {
        if (answeredCount === 0) {
            toast.warning('Vui lòng trả lời ít nhất một câu hỏi trước khi nộp bài');
            return;
        }
        setShowSubmitDialog(true);
    }, [answeredCount]);

    const handleConfirmSubmit = useCallback(async () => {
        try {
            const result = await handleSubmitExam();

            if (result) {
                setShowSubmitDialog(false);
                setShowResult(true);
                onShowResult?.(true);
            }
        } catch (error) {
            console.error('Submit error:', error);
        }
    }, [handleSubmitExam, onShowResult]);

    const handleFinishPart = useCallback(() => {
        if (isLastPart && onSubmitTest) {
            onSubmitTest();
        } else {
            onPartComplete?.();
        }
    }, [isLastPart, onSubmitTest, onPartComplete]);

    const handleViewDetails = useCallback(() => {
        if (submissionResult) {
            router.push(`/exams/attempts/${submissionResult.attemptId}/result`);
        }
    }, [router, submissionResult]);

    const handleRetakeExam = useCallback(() => {
        onShowResult?.(false);
        window.location.reload();
    }, [onShowResult]);

    // Early returns for different states
    if (showResult && submissionResult) {
        return (
            <ExamResult
                isFullExam={isFullExam}
                result={submissionResult}
                onViewDetails={handleViewDetails}
                onRetakeExam={handleRetakeExam}
            />
        );
    }

    if (!currentGroup) {
        return (
            <div className="text-center text-red-500 py-8">
                <p>Không tìm thấy câu hỏi cho phần này.</p>
                <p className="text-sm mt-2">Vui lòng kiểm tra lại dữ liệu hoặc thử làm mới trang.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header - Chỉ hiển thị khi không trong trạng thái showResult */}
            {!showResult && (
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">
                        Part {partData.partNumber}: {getPartName()}
                    </h1>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50">
                            {remainingTime !== 0 && (
                                <>
                                    <Clock className="h-4 w-4 text-gray-900" />
                                    <span className="font-mono text-lg font-semibold">
                                        {formatTime(remainingTime)}
                                    </span>
                                </>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleSubmitClick}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Question Navigation Grid - Chỉ hiển thị khi không trong trạng thái showResult */}
            {!showResult && (
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
            )}

            {/* Main Content */}
            {!showResult && (
                <>
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

                            {/* Questions */}
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
                                                <QuestionComponent
                                                    key={question.questionId}
                                                    question={question}
                                                    partNumber={partData.partNumber}
                                                    currentGroup={currentGroup}
                                                    answers={answers}
                                                    markedForReview={markedForReview}
                                                    onAnswerChange={handleAnswerChange}
                                                    onMarkForReview={handleMarkForReview}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {currentGroup.questions.map((question) => (
                                        <QuestionComponent
                                            key={question.questionId}
                                            question={question}
                                            partNumber={partData.partNumber}
                                            currentGroup={currentGroup}
                                            answers={answers}
                                            markedForReview={markedForReview}
                                            onAnswerChange={handleAnswerChange}
                                            onMarkForReview={handleMarkForReview}
                                        />
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
                            {isLastPart ? (
                                <Button variant="ghost" onClick={handleSubmitClick}>
                                    Nộp bài
                                </Button>
                            ) : (
                                <Button variant="ghost" onClick={handleFinishPart}>
                                    Chuyển part tiếp theo
                                </Button>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Submit Confirmation Dialog */}
            <SubmitConfirmDialog
                open={showSubmitDialog}
                onOpenChange={setShowSubmitDialog}
                onConfirm={handleConfirmSubmit}
                isSubmitting={isSubmitting}
            />
        </div>
    );
});

ToeicTest.displayName = 'ToeicTest';

export default ToeicTest;
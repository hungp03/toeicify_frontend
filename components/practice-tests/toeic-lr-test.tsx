'use client';
import { useEffect, useCallback, useMemo, useState, memo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { FileText, Loader2 } from 'lucide-react';

import { PartData } from '@/types/question';
import { SubmitExamRequest, ExamSubmissionResponse } from '@/types';
import { submitExam } from '@/lib/api/exam';

// Import custom hooks
import { useExamState } from '@/hooks/use-exam-state';
import { useAudioState } from '@/hooks/use-audio-state';


// Import components
import ExamHeader from '@/components/practice-tests/exam-header';
import QuestionNavigation from '@/components/practice-tests/question-navigation';
import AudioPlayer from '@/components/practice-tests/audio-player';
import ExamNavigation from '@/components/practice-tests/exam-navigation';
import FullTestStartOverlay from '@/components/practice-tests/full-test-start-overlay';

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
    hasStarted?: boolean;
    onStart?: () => void;
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
    onAudioStatusChange?: (status: { isPlaying: boolean; hasEnded: boolean; countdown: number }) => void;
}

function toUtcNoMsZ(d: Date): string {
    return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function ToeicTest({
    partData,
    hasStarted,
    onStart,
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
    onShowResult,
    onAudioStatusChange,
}: Props) {
    const params = useParams();
    const router = useRouter();

    const [examStartTimeState] = useState(() => examStartTime || new Date());
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<ExamSubmissionResponse | null>(null);
    const [showResult, setShowResult] = useState(false);

    // Compute part types
    const isListeningPart = useMemo(() =>
        partData.partNumber >= 1 && partData.partNumber <= 4,
        [partData.partNumber]
    );

    const isReadingPart = useMemo(() =>
        partData.partNumber >= 5 && partData.partNumber <= 7,
        [partData.partNumber]
    );

    const isNavigationRestricted = useMemo(() =>
        isListeningPart && isFullExam,
        [isListeningPart, isFullExam]
    );

    // Use custom hooks
    const {
        answers,
        markedForReview,
        currentGroupIndex,
        setCurrentGroupIndex,
        handleAnswerChange,
        handleMarkForReview,
        answeredCount,
        totalQuestions
    } = useExamState(
        partData,
        initialAnswers,
        initialMarkedForReview,
        onAnswersChange,
        onMarkedForReviewChange,
        remainingTime,
        isReadingPart,
        isFullExam
    );

    const {
        audioRef,
        isAudioPlaying,
        audioEnded,
        autoAdvanceCountdown,
        handleAudioPlay,
        handleAudioPause,
        handleAudioEnded
    } = useAudioState({
        isNavigationRestricted,
        currentGroupIndex,
        totalGroups: partData.groups.length,
        onGroupChange: setCurrentGroupIndex,
        onPartComplete,
        onAudioStatusChange
    });

    // Current group
    const currentGroup = useMemo(() =>
        partData.groups[currentGroupIndex],
        [partData.groups, currentGroupIndex]
    );

    const hasImage = useMemo(() =>
        (partData.partNumber === 1 || (partData.partNumber >= 6 && currentGroup?.imageUrl)) && currentGroup?.imageUrl,
        [partData.partNumber, currentGroup?.imageUrl]
    );

    // Get part name
    const getPartName = useCallback(() => {
        if (partData.description) return partData.description;
        const partNames: Record<number, string> = {
            1: 'Photographs', 2: 'Question-Response', 3: 'Conversations',
            4: 'Talks', 5: 'Incomplete Sentences', 6: 'Text Completion', 7: 'Reading Comprehension'
        };
        return partNames[partData.partNumber] || 'Unknown Part';
    }, [partData.description, partData.partNumber]);

    // Navigation handlers
    const handleNextGroup = useCallback(() => {
        if (isNavigationRestricted && (!audioEnded || autoAdvanceCountdown > 0)) return;
        setCurrentGroupIndex(prev => Math.min(prev + 1, partData.groups.length - 1));
    }, [partData.groups.length, isNavigationRestricted, audioEnded, autoAdvanceCountdown, setCurrentGroupIndex]);

    const handlePreviousGroup = useCallback(() => {
        if (isNavigationRestricted && (!audioEnded || autoAdvanceCountdown > 0)) return;
        setCurrentGroupIndex(prev => Math.max(prev - 1, 0));
    }, [isNavigationRestricted, audioEnded, autoAdvanceCountdown, setCurrentGroupIndex]);

    // Global answered count
    const answeredCountGlobal = useMemo(() => {
        const all = { ...allAnswers };
        Object.entries(answers).forEach(([qid, val]) => {
            const partId = partData.partId.toString();
            if (!all[partId]) all[partId] = {};
            all[partId][Number(qid)] = val;
        });
        return Object.values(all).flatMap(part => Object.values(part)).filter(v => !!v).length;
    }, [allAnswers, answers, partData.partId]);

    // Submit handlers
    const handleSubmitExam = useCallback(async (): Promise<ExamSubmissionResponse | null> => {
        setIsSubmitting(true);
        try {
            const isFullTest = isFullExam || (totalParts > 1 && allPartIds.length > 1);
            let finalAnswers: Array<{ questionId: number, selectedOption: string }> = [];
            let finalPartIds: number[] = [];

            if (isFullTest) {
                finalPartIds = allPartIds;
                if (allAnswers && Object.keys(allAnswers).length > 0) {
                    Object.values(allAnswers).forEach(partAnswers => {
                        Object.entries(partAnswers).forEach(([questionId, selectedOption]) => {
                            finalAnswers.push({ questionId: parseInt(questionId, 10), selectedOption });
                        });
                    });
                }
                Object.entries(answers).forEach(([questionId, selectedOption]) => {
                    const questionIdNum = parseInt(questionId, 10);
                    const alreadyIncluded = finalAnswers.some(a => a.questionId === questionIdNum);
                    if (!alreadyIncluded) {
                        finalAnswers.push({ questionId: questionIdNum, selectedOption });
                    }
                });
            } else {
                finalPartIds = [Number(partData.partId)];
                finalAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
                    questionId: parseInt(questionId, 10), selectedOption
                }));
            }

            if (finalAnswers.length === 0) {
                toast.error('Vui lòng trả lời ít nhất một câu hỏi');
                return null;
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
            let errorMessage = 'Có lỗi xảy ra khi nộp bài';
            if (error.response?.data?.message) errorMessage = error.response.data.message;
            else if (error.message) errorMessage = error.message;
            toast.error(errorMessage);
            return null;
        } finally {
            setIsSubmitting(false);
        }
    }, [answers, allAnswers, allPartIds, totalParts, isLastPart, isFullExam, params.id, partData.partId, examStartTimeState]);

    const handleSubmitClick = useCallback(() => {
        if (answeredCountGlobal === 0) {
            toast.warning('Vui lòng trả lời ít nhất một câu hỏi trước khi nộp bài');
            return;
        }
        setShowSubmitDialog(true);
    }, [answeredCountGlobal]);

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
            router.push(`/practice-tests/result/${submissionResult.attemptId}`);
        }
    }, [router, submissionResult]);

    const handleRetakeExam = useCallback(() => {
        onShowResult?.(false);
        window.location.reload();
    }, [onShowResult]);

    // Effects
    useEffect(() => {
        if (remainingTime === 60) {
            toast.warning("Chỉ còn 1 phút! Hãy hoàn thành bài thi của bạn.");
        }
    }, [remainingTime]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isNavigationRestricted) return;
            if (e.key === "ArrowRight") handleNextGroup();
            if (e.key === "ArrowLeft") handlePreviousGroup();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleNextGroup, handlePreviousGroup, isNavigationRestricted]);

    // Early returns
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

    if (isFullExam && !hasStarted) {
        return <FullTestStartOverlay onStart={onStart || (() => {})} />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {!showResult && (
                <ExamHeader
                    partNumber={partData.partNumber}
                    partName={getPartName()}
                    isListeningPart={isListeningPart}
                    isReadingPart={isReadingPart}
                    remainingTime={remainingTime}
                    isSubmitting={isSubmitting}
                    onSubmitClick={handleSubmitClick}
                />
            )}

            {!showResult && (
                <QuestionNavigation
                    partData={partData}
                    currentGroupIndex={currentGroupIndex}
                    answers={answers}
                    markedForReview={markedForReview}
                    isNavigationRestricted={isNavigationRestricted}
                    isReadingPart={isReadingPart}
                    isFullExam={isFullExam}
                    onGroupChange={setCurrentGroupIndex}
                />
            )}

            {!showResult && (
                <>
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            {/* Audio Player for listening parts */}
                            {isListeningPart && currentGroup.audioUrl && (
                                <AudioPlayer
                                    audioUrl={currentGroup.audioUrl}
                                    isFullExam={isFullExam}
                                    onPlay={handleAudioPlay}
                                    onPause={handleAudioPause}
                                    onEnded={handleAudioEnded}
                                    audioRef={audioRef}
                                    autoAdvanceCountdown={autoAdvanceCountdown}
                                />
                            )}

                            {/* Reading passage */}
                            {isReadingPart && currentGroup.passageText && (
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
                                                    isListeningPart={isListeningPart}
                                                    showMarkForReview={!isNavigationRestricted}
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
                                            isListeningPart={isListeningPart}
                                            showMarkForReview={!isNavigationRestricted}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <ExamNavigation
                        currentGroupIndex={currentGroupIndex}
                        totalGroups={partData.groups.length}
                        isLastPart={isLastPart}
                        isNavigationRestricted={isNavigationRestricted}
                        audioEnded={audioEnded}
                        autoAdvanceCountdown={autoAdvanceCountdown}
                        onPrevious={handlePreviousGroup}
                        onNext={handleNextGroup}
                        onSubmitClick={handleSubmitClick}
                        onFinishPart={handleFinishPart}
                    />
                </>
            )}

            <SubmitConfirmDialog
                open={showSubmitDialog}
                onOpenChange={setShowSubmitDialog}
                onConfirm={handleConfirmSubmit}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

ToeicTest.displayName = 'ToeicTest';

export default memo(ToeicTest);
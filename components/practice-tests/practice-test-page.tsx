'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ToeicTest from './toeic-lr-test';
import FullPageLoader from '@/components/common/full-page-loader';

// Custom hooks
import { useNavigationWarning } from '@/hooks/use-navigation-warning';
import { useExamTimer } from '@/hooks/use-exam-timer';
import { useExamData } from '@/hooks/use-exam-data';
import { useAudioStatus } from '@/hooks/use-audio-status';

import ExamPartBar from '@/components/practice-tests/exam-part-bar';
import ExamFinished from '@/components/practice-tests/exam-finished';
import ExamError from '@/components/practice-tests/exam-error';

export default function TestPage() {
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [testFinished, setTestFinished] = useState<boolean>(false);
  const [examStartTime] = useState(() => new Date());
  const [showingResult, setShowingResult] = useState<boolean>(false);

  // Custom hooks
  const {
    examData,
    partIds,
    partNumbers,
    currentPartIndex,
    currentPartData,
    loading,
    loadingPart,
    error,
    allAnswersRef,
    allMarkedForReviewRef,
    partDataCacheRef,
    setCurrentPartIndex,
    setError,
    updateAnswers,
    updateMarkedForReview,
    handleNextPart
  } = useExamData();

  const { audioStatus, updateAudioStatus } = useAudioStatus();

  // Determine if test is active
  const isTestActive = !loading && !error && !testFinished && !showingResult && partIds.length > 0;

  const { initialTime, remainingTime, isFullExam, setRemainingTime } = useExamTimer({
    isPaused,
    testFinished,
    onTimeUp: () => setTestFinished(true)
  });

  const { safeNavigate, disableTestWarning } = useNavigationWarning({
    isTestActive,
    warningMessage: 'Bạn có chắc muốn rời khỏi bài test? Tất cả tiến trình làm bài sẽ bị mất và không thể khôi phục.'
  });

  // Handlers
  const handleBackToSetup = useCallback(() => {
    safeNavigate(`/practice-tests/${examData?.examId || ''}`);
  }, [safeNavigate, examData?.examId]);

  const handleSubmitTest = useCallback(() => {
    disableTestWarning();
    setTestFinished(true);
  }, [disableTestWarning]);

  const handleExitTest = useCallback(() => {
    const confirmExit = window.confirm(
      "Bạn có chắc muốn thoát khỏi bài test?\n\nTất cả tiến trình làm bài sẽ bị mất và không thể khôi phục. Bạn sẽ cần bắt đầu lại từ đầu nếu muốn làm bài test này."
    );

    if (confirmExit) {
      disableTestWarning();
      router.push("/practice-tests");
    }
  }, [disableTestWarning, router]);

  const handlePartChange = useCallback((index: number) => {
    setCurrentPartIndex(index);
  }, [setCurrentPartIndex]);

  const handleRetry = useCallback(() => {
    setError(null);
    setCurrentPartIndex(currentPartIndex); // Trigger refetch
  }, [setError, setCurrentPartIndex, currentPartIndex]);

  // Render states
  if (testFinished) {
    return (
      <ExamFinished
        remainingTime={remainingTime}
        initialTime={initialTime}
        allAnswers={allAnswersRef.current}
        partDataCache={partDataCacheRef.current}
      />
    );
  }

  if (loading) {
    return <FullPageLoader />;
  }

  if (error) {
    return (
      <ExamError
        error={error}
        onBackToSetup={handleBackToSetup}
        onRetry={handleRetry}
      />
    );
  }

  const currentPartId = partIds[currentPartIndex];

  return (
    <div>
      {/* Navigation Bar */}
      {!testFinished && !showingResult && (
        <ExamPartBar
          examData={examData}
          partIds={partIds}
          partNumbers={partNumbers}
          currentPartIndex={currentPartIndex}
          loadingPart={loadingPart}
          isFullExam={isFullExam}
          audioStatus={audioStatus}
          onPartChange={handlePartChange}
          onExitTest={handleExitTest}
        />
      )}

      {/* Main Content */}
      {loadingPart ? (
        <div className="text-center py-8">
          Đang tải Part {currentPartIndex + 1}...
        </div>
      ) : currentPartData ? (
        <ToeicTest
          key={currentPartId}
          hasStarted={hasStarted}
          onStart={() => setHasStarted(true)}
          partData={currentPartData}
          onPartComplete={handleNextPart}
          isLastPart={currentPartIndex === partIds.length - 1}
          currentPartIndex={currentPartIndex + 1}
          totalParts={partIds.length}
          isPaused={isPaused}
          remainingTime={remainingTime}
          onTimeChange={setRemainingTime}
          onSubmitTest={handleSubmitTest}
          initialAnswers={allAnswersRef.current[currentPartId] || {}}
          initialMarkedForReview={allMarkedForReviewRef.current[currentPartId] || {}}
          onAnswersChange={(answers) => updateAnswers(currentPartId, answers)}
          onMarkedForReviewChange={(marked) => updateMarkedForReview(currentPartId, marked)}
          allPartIds={partIds.map(id => parseInt(id))}
          allAnswers={allAnswersRef.current}
          examStartTime={examStartTime}
          isFullExam={isFullExam}
          onShowResult={setShowingResult}
          onAudioStatusChange={updateAudioStatus}
        />
      ) : null}
    </div>
  );
}
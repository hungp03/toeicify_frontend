import { useState, useEffect, useCallback, useMemo } from 'react';
import { PartData } from '@/types/question';

interface ExamStateHook {
  answers: Record<number, string>;
  markedForReview: Record<number, boolean>;
  currentGroupIndex: number;
  hasShownOneMinuteToast: boolean;
  setCurrentGroupIndex: (index: number | ((prev: number) => number)) => void;
  handleAnswerChange: (questionId: number, val: string) => void;
  handleMarkForReview: (questionId: number) => void;
  answeredCount: number;
  totalQuestions: number;
}

export const useExamState = (
  partData: PartData,
  initialAnswers: Record<number, string>,
  initialMarkedForReview: Record<number, boolean>,
  onAnswersChange: (answers: Record<number, string>) => void,
  onMarkedForReviewChange: (marked: Record<number, boolean>) => void,
  remainingTime: number,
  isReadingPart: boolean,
  isFullExam: boolean
): ExamStateHook => {
  const [answers, setAnswers] = useState<Record<number, string>>(initialAnswers);
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>(initialMarkedForReview);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [hasShownOneMinuteToast, setHasShownOneMinuteToast] = useState(false);

  // Reset state when part changes
  useEffect(() => {
    setCurrentGroupIndex(0);
  }, [partData.partId]);

  // Sync with initial values
  useEffect(() => {
    setAnswers(initialAnswers);
    setMarkedForReview(initialMarkedForReview);
  }, [initialAnswers, initialMarkedForReview]);

  // Debounced sync with parent
  useEffect(() => {
    const timeoutId = setTimeout(() => onAnswersChange(answers), 200);
    return () => clearTimeout(timeoutId);
  }, [answers, onAnswersChange]);

  useEffect(() => {
    const timeoutId = setTimeout(() => onMarkedForReviewChange(markedForReview), 200);
    return () => clearTimeout(timeoutId);
  }, [markedForReview, onMarkedForReviewChange]);

  const handleAnswerChange = useCallback((questionId: number, val: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: val }));
  }, []);

  const handleMarkForReview = useCallback((questionId: number) => {
    if (isReadingPart || !isFullExam) {
      setMarkedForReview(prev => ({ ...prev, [questionId]: !prev[questionId] }));
    }
  }, [isReadingPart, isFullExam]);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  
  const totalQuestions = useMemo(() => 
    partData.groups.reduce((sum, group) => sum + group.questions.length, 0),
    [partData.groups]
  );

  return {
    answers,
    markedForReview,
    currentGroupIndex,
    hasShownOneMinuteToast,
    setCurrentGroupIndex,
    handleAnswerChange,
    handleMarkForReview,
    answeredCount,
    totalQuestions
  };
};
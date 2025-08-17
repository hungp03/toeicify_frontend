import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface UseExamTimerProps {
  isPaused: boolean;
  testFinished: boolean;
  onTimeUp: () => void;
}

export const useExamTimer = ({ isPaused, testFinished, onTimeUp }: UseExamTimerProps) => {
  const searchParams = useSearchParams();
  const [initialTime, setInitialTime] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [isFullExam, setIsFullExam] = useState(false);

  // Set initial timer
  useEffect(() => {
    const timeParam = searchParams.get('time');
    const partsParam = searchParams.get('parts');
    const isFullTest = partsParam === 'all';
    setIsFullExam(isFullTest);
    
    if (isFullTest) {
      // Full exam always 120 minutes (7200 seconds)
      setInitialTime(7200);
      setRemainingTime(7200);
    } else if (!timeParam || timeParam === 'unlimited') {
      setInitialTime(0);
      setRemainingTime(0);
    } else {
      const minutes = parseInt(timeParam, 10);
      if (!Number.isNaN(minutes) && minutes > 0) {
        setInitialTime(minutes * 60);
        setRemainingTime(minutes * 60);
      } else {
        setInitialTime(0);
        setRemainingTime(0);
      }
    }
  }, [searchParams]);

  // Timer countdown
  useEffect(() => {
    if (initialTime === 0 || isPaused || testFinished || remainingTime <= 0) return;
    
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [initialTime, isPaused, remainingTime, testFinished, onTimeUp]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    initialTime,
    remainingTime,
    isFullExam,
    formatTime,
    setRemainingTime
  };
};
import { useState, useRef, useCallback, useEffect } from "react";

interface AudioStateHook {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isAudioPlaying: boolean;
  audioEnded: boolean;
  autoAdvanceCountdown: number;
  handleAudioPlay: () => void;
  handleAudioPause: () => void;
  handleAudioEnded: () => void;
}

interface UseAudioStateParams {
  isNavigationRestricted: boolean;
  currentGroupIndex: number;
  totalGroups: number;
  onGroupChange: (index: number) => void;
  onPartComplete?: () => void;
  onAudioStatusChange?: (status: {
    isPlaying: boolean;
    hasEnded: boolean;
    countdown: number;
  }) => void;
}

export const useAudioState = ({
  isNavigationRestricted,
  currentGroupIndex,
  totalGroups,
  onGroupChange,
  onPartComplete,
  onAudioStatusChange,
}: UseAudioStateParams): AudioStateHook => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(0);

  // Reset audio state when group changes
  useEffect(() => {
    setIsAudioPlaying(false);
    setAudioEnded(false);
    setAutoAdvanceCountdown(0);

    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, [currentGroupIndex]);

  const handleAudioPlay = useCallback(() => {
    setIsAudioPlaying(true);
    setAudioEnded(false);
    setAutoAdvanceCountdown(0);

    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const handleAudioPause = useCallback(() => {
    setIsAudioPlaying(false);
  }, []);

  const handleAudioEnded = useCallback(() => {
    setIsAudioPlaying(false);
    setAudioEnded(true);

    if (isNavigationRestricted) {
      let countdown = 3;
      setAutoAdvanceCountdown(countdown);

      countdownIntervalRef.current = setInterval(() => {
        countdown--;
        setAutoAdvanceCountdown(countdown);
        if (countdown <= 0 && countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }, 1000);

      autoAdvanceTimeoutRef.current = setTimeout(() => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setAutoAdvanceCountdown(0);

        if (currentGroupIndex < totalGroups - 1) {
          onGroupChange(currentGroupIndex + 1);
        } else {
          onPartComplete?.();
        }
      }, 5000);
    }
  }, [
    isNavigationRestricted,
    currentGroupIndex,
    totalGroups,
    onGroupChange,
    onPartComplete,
  ]);

  // Notify parent
  useEffect(() => {
    onAudioStatusChange?.({
      isPlaying: isAudioPlaying,
      hasEnded: audioEnded,
      countdown: autoAdvanceCountdown,
    });
  }, [isAudioPlaying, audioEnded, autoAdvanceCountdown, onAudioStatusChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  return {
    audioRef,
    isAudioPlaying,
    audioEnded,
    autoAdvanceCountdown,
    handleAudioPlay,
    handleAudioPause,
    handleAudioEnded,
  };
};

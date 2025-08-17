import { useState, useCallback } from "react";

interface AudioStatus {
  isPlaying: boolean;
  hasEnded: boolean;
  countdown: number;
}

export const useAudioStatus = () => {
  const [audioStatus, setAudioStatus] = useState<AudioStatus>({
    isPlaying: false,
    hasEnded: false,
    countdown: 0,
  });

  const updateAudioStatus = useCallback((status: Partial<AudioStatus>) => {
    setAudioStatus((prev) => ({ ...prev, ...status }));
  }, []);

  const setPlaying = useCallback(() => updateAudioStatus({ isPlaying: true, hasEnded: false }), [updateAudioStatus]);
  const setEnded = useCallback(() => updateAudioStatus({ isPlaying: false, hasEnded: true, countdown: 0 }), [updateAudioStatus]);
  const setCountdown = useCallback((count: number) => updateAudioStatus({ countdown: count }), [updateAudioStatus]);

  return {
    audioStatus,
    updateAudioStatus,
    setPlaying,
    setEnded,
    setCountdown,
  };
};

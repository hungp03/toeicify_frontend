"use client";

import { RefObject, useEffect, useRef } from "react";

interface AudioPlayerProps {
  audioUrl: string;
  isFullExam: boolean;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
  audioRef: RefObject<HTMLAudioElement | null>;
  autoAdvanceCountdown: number;
}

export default function AudioPlayer({
  audioUrl,
  isFullExam,
  onPlay,
  onPause,
  onEnded,
  audioRef,
  autoAdvanceCountdown,
}: AudioPlayerProps) {
  const lastTimeRef = useRef(0);
  const allowSeekRef = useRef(true);

  // Load audio và autoplay (muted để tránh bị chặn)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = audioUrl;
    audio.load();

    if (isFullExam) {
      audio.muted = true;
      audio.currentTime = 0;

      const playAudio = () => {
        audio
          .play()
          .then(() => {
            audio.muted = false; // unmute sau khi đã play
          })
          .catch((err) => {
            console.warn("Autoplay failed:", err);
          });
      };

      if (audio.readyState >= 2) {
        playAudio();
      } else {
        audio.addEventListener("canplay", playAudio, { once: true });
      }
    }
  }, [audioUrl, isFullExam, audioRef]);

  // Chặn hành vi không mong muốn
  useEffect(() => {
    const audio = audioRef.current;
    if (!isFullExam || !audio) return;

    const handlePause = () => {
      if (!audio.ended) {
        audio.play().catch(() => {});
      }
    };

    const handleRateChange = () => {
      if (audio.playbackRate !== 1) {
        audio.playbackRate = 1;
      }
    };

    const handleTimeUpdate = () => {
      lastTimeRef.current = audio.currentTime;
    };

    const handleSeeking = () => {
      if (!allowSeekRef.current) return;
      const delta = Math.abs(audio.currentTime - lastTimeRef.current);
      if (delta > 0.5) {
        allowSeekRef.current = false;
        audio.currentTime = lastTimeRef.current;
        setTimeout(() => {
          allowSeekRef.current = true;
        }, 300);
      }
    };

    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ratechange", handleRateChange);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("seeking", handleSeeking);

    return () => {
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ratechange", handleRateChange);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("seeking", handleSeeking);
    };
  }, [isFullExam, audioRef]);

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium text-blue-700">
          Audio - Listen carefully
          {isFullExam && " (plays once)"}
        </span>
      </div>

      <audio
        ref={audioRef}
        key={audioUrl}
        className="w-full"
        controls={!isFullExam}
        controlsList={isFullExam ? "nodownload noseek noplaybackrate" : "nodownload"}
        onContextMenu={(e) => e.preventDefault()}
        onPlay={onPlay}
        onPause={(e) => {
          if (isFullExam && !e.currentTarget.ended) {
            e.preventDefault();
            e.currentTarget.play().catch(() => {});
          } else {
            onPause();
          }
        }}
        onEnded={onEnded}
      >
        <source src={audioUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      {isFullExam && (
        <div className="mt-2 text-xs text-gray-600">
          Lưu ý: Trong bài thi đầy đủ, âm thanh sẽ tự động phát và không thể dừng, tua hoặc đổi tốc độ
        </div>
      )}

      {autoAdvanceCountdown > 0 && (
        <div className="mt-2 text-xs text-blue-600">
          Chuyển câu tiếp theo sau {autoAdvanceCountdown}s
        </div>
      )}
    </div>
  );
}

"use client";

import { RefObject } from "react";

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
        controls
        className="w-full"
        key={audioUrl}
        controlsList={isFullExam ? "nodownload noseek" : "nodownload"}
        onContextMenu={(e) => e.preventDefault()}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
      >
        <source src={audioUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {autoAdvanceCountdown > 0 && (
        <div className="mt-2 text-xs text-blue-600">
          Chuyển câu tiếp theo sau {autoAdvanceCountdown}s
        </div>
      )}
    </div>
  );
}

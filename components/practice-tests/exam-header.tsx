"use client";

import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface ExamHeaderProps {
  partNumber: number;
  partName: string;
  isListeningPart: boolean;
  isReadingPart: boolean;
  remainingTime: number;
  isSubmitting: boolean;
  onSubmitClick: () => void;
}

function formatTime(s: number): string {
  if (s <= 0) return "00:00";
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function ExamHeader({
  partNumber,
  partName,
  isListeningPart,
  isReadingPart,
  remainingTime,
  isSubmitting,
  onSubmitClick,
}: ExamHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">
        Part {partNumber}: {partName}
        {isListeningPart && (
          <span className="text-sm text-blue-600 ml-2">(Listening)</span>
        )}
        {isReadingPart && (
          <span className="text-sm text-green-600 ml-2">(Reading)</span>
        )}
      </h1>

      <div className="flex items-center space-x-4">
        {/* Timer */}
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50">
          {remainingTime > 0 && (
            <>
              <Clock className="h-4 w-4 text-gray-900" />
              <span className="font-mono text-lg font-semibold">
                {formatTime(remainingTime)}
              </span>
            </>
          )}
        </div>

        {/* Submit button */}
        <Button
          variant="outline"
          onClick={onSubmitClick}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang nộp..." : "Nộp bài"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { ExamData } from "@/types/exam";
import clsx from "clsx";

interface AudioStatus {
  isPlaying: boolean;
  hasEnded: boolean;
  countdown: number;
}

interface ExamPartBarProps {
  examData: ExamData | null;
  partIds: string[];
  partNumbers: string[];
  currentPartIndex: number;
  loadingPart: boolean;
  isFullExam: boolean;
  audioStatus: AudioStatus;
  onPartChange: (index: number) => void;
  onExitTest: () => void;
}

export default function ExamPartBar({
  examData,
  partIds,
  partNumbers,
  currentPartIndex,
  loadingPart,
  isFullExam,
  audioStatus,
  onPartChange,
  onExitTest,
}: ExamPartBarProps) {
  if (partIds.length === 0) return null;

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Exam title + current part */}
          <div className="text-sm text-gray-600">
            {examData?.examName && (
              <span className="font-medium">{examData.examName}</span>
            )}
            {partIds.length >= 2 && (
              <span> - Part {partNumbers[currentPartIndex]}</span>
            )}
          </div>

          {/* Navigation between parts */}
          {partIds.length >= 2 && (
            <div className="flex items-center space-x-4">
              <div className="flex space-x-1">
                {partNumbers.map((partNumber, index) => {
                  const partNum = parseInt(partNumber, 10);
                  const isListeningPart = partNum >= 1 && partNum <= 4;
                  const isReadingPart = partNum >= 5 && partNum <= 7;

                  const currentPartNum = parseInt(
                    partNumbers[currentPartIndex],
                    10
                  );
                  const isCurrentListeningPart =
                    currentPartNum >= 1 && currentPartNum <= 4;

                  // Restriction when audio not finished
                  const isAudioRestricted =
                    isFullExam &&
                    isCurrentListeningPart &&
                    (!audioStatus.hasEnded || audioStatus.countdown > 0);

                  let isDisabled = loadingPart;
                  let disableReason = "";

                  if (isFullExam) {
                    if (isListeningPart && index !== currentPartIndex) {
                      isDisabled = true;
                      disableReason =
                        "Không thể chuyển đến listening part khác trong full test";
                    } else if (isReadingPart && isAudioRestricted) {
                      isDisabled = true;
                      disableReason =
                        "Hãy hoàn thành listening part trước khi chuyển sang reading";
                    }
                  }

                  return (
                    <Button
                      key={partNumber}
                      size="sm"
                      variant={
                        index === currentPartIndex ? "default" : "ghost"
                      }
                      onClick={() => {
                        if (!isDisabled) onPartChange(index);
                      }}
                      disabled={isDisabled}
                      title={disableReason}
                      className={clsx(
                        "min-w-[50px] h-8 text-xs",
                        index === currentPartIndex
                          ? "bg-blue-600 text-white"
                          : isDisabled
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-100"
                      )}
                    >
                      Part {partNumber}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Exit button */}
          <Button
            size="sm"
            onClick={onExitTest}
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Thoát
          </Button>
        </div>
      </div>
    </div>
  );
}

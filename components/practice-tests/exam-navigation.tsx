"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ExamNavigationProps {
  currentGroupIndex: number;
  totalGroups: number;
  isLastPart: boolean;
  isNavigationRestricted: boolean;
  audioEnded: boolean;
  autoAdvanceCountdown: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmitClick: () => void;
  onFinishPart: () => void;
}

export default function ExamNavigation({
  currentGroupIndex,
  totalGroups,
  isLastPart,
  isNavigationRestricted,
  audioEnded,
  autoAdvanceCountdown,
  onPrevious,
  onNext,
  onSubmitClick,
  onFinishPart,
}: ExamNavigationProps) {
  const isNavigationDisabled =
    isNavigationRestricted && (!audioEnded || autoAdvanceCountdown > 0);

  return (
    <div className="flex justify-between items-center">
      {/* Previous button */}
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentGroupIndex === 0 || isNavigationDisabled}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Trước
      </Button>

      {/* Next / Submit / Finish Part */}
      <div className="flex items-center space-x-2">
        <Button
          onClick={onNext}
          disabled={
            currentGroupIndex === totalGroups - 1 || isNavigationDisabled
          }
        >
          Tiếp theo
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>

        {isLastPart ? (
          <Button variant="ghost" onClick={onSubmitClick}>
            Nộp bài
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={onFinishPart}
            disabled={isNavigationDisabled}
          >
            Chuyển part tiếp theo
          </Button>
        )}
      </div>
    </div>
  );
}

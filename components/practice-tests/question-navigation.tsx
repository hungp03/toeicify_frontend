"use client";

import { Flag } from "lucide-react";
import { PartData } from "@/types/question";
import clsx from "clsx";

interface QuestionNavigationProps {
  partData: PartData;
  currentGroupIndex: number;
  answers: Record<number, string>;
  markedForReview: Record<number, boolean>;
  isNavigationRestricted: boolean;
  isReadingPart: boolean;
  isFullExam: boolean;
  onGroupChange: (groupIndex: number) => void;
}

export default function QuestionNavigation({
  partData,
  currentGroupIndex,
  answers,
  markedForReview,
  isNavigationRestricted,
  isReadingPart,
  isFullExam,
  onGroupChange,
}: QuestionNavigationProps) {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">
          Danh sách câu hỏi
          {isNavigationRestricted && (
            <span className="text-xs text-blue-600 ml-2">
              (Full Test - Chỉ có thể xem, không thể chuyển câu)
            </span>
          )}
        </h3>

        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
            <span>Đã trả lời</span>
          </div>

          {(isReadingPart || !isFullExam) && (
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded" />
              <span>Đánh dấu để xem lại</span>
            </div>
          )}

          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span>Câu hỏi hiện tại</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {partData.groups.map((group, groupIndex) => (
            <div key={group.groupId} className="flex space-x-1 mr-4 mt-4">
              {group.questions.map((q) => {
                const isAnswered = !!answers[q.questionId];
                const isMarked =
                  (isReadingPart || !isFullExam) &&
                  !!markedForReview[q.questionId];
                const isCurrentGroup = groupIndex === currentGroupIndex;

                return (
                  <button
                    key={q.questionId}
                    onClick={() => {
                      if (!isNavigationRestricted) {
                        onGroupChange(groupIndex);
                      }
                    }}
                    disabled={isNavigationRestricted}
                    className={clsx(
                      "flex-shrink-0 w-10 h-10 text-xs rounded-lg border-2 font-medium transition-all relative",
                      isNavigationRestricted
                        ? "cursor-not-allowed opacity-75"
                        : "cursor-pointer",
                      isCurrentGroup
                        ? "bg-blue-500 text-white border-blue-500 shadow-lg"
                        : isAnswered && isMarked
                        ? "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200"
                        : isAnswered
                        ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
                        : isMarked
                        ? "bg-orange-50 text-orange-600 border-orange-300 hover:bg-orange-100"
                        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {q.questionNumber}
                    {isMarked && (
                      <Flag className="absolute -top-1 -right-1 h-2 w-2 text-orange-500" />
                    )}
                  </button>
                );
              })}

              {groupIndex < partData.groups.length - 1 && (
                <div className="w-px h-10 bg-gray-300 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useRef } from "react";
import type { ViewQuestionDetailProps } from "@/types"; // dùng interface đã sửa ở trên
import type { QuestionResponse } from "@/types/question";

export function QuestionDetailModal({
  groupId,
  questionId,
  groups,
  onClose,
}: ViewQuestionDetailProps) {
  const group = useMemo(
    () => groups.find((g) => g.groupId === groupId),
    [groups, groupId]
  );

  // Map option A→D: sort an toàn
  const sortOptions = (opts: QuestionResponse["options"]) =>
    [...(opts || [])].sort((a, b) => a.optionLetter.localeCompare(b.optionLetter));

  // ref để scroll tới câu cần focus
  const focusedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!focusedRef.current) return;
    // scroll mượt tới câu được chọn
    focusedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusedRef.current]);

  if (!group) return null;

  const isReadingPassageWithFullImage = group.partId === 6 || group.partId === 7;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] p-6 shadow-lg relative overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">
          Nhóm câu hỏi (Group #{group.groupId}) — {group.partName}
        </h2>

        {/* Media & passage */}
        {(group.imageUrl || group.audioUrl) && (
          <div className="mt-3 flex flex-col gap-2">
            {group.imageUrl && (
              <img
                src={group.imageUrl}
                alt="group"
                className={isReadingPassageWithFullImage ? "w-full rounded border" : "w-48 rounded border"}
              />
            )}
            {group.audioUrl && (
              <audio controls className="max-w-md">
                <source src={group.audioUrl} type="audio/mpeg" />
              </audio>
            )}
          </div>
        )}

        {group.passageText && group.partId !== 1 
                  && group.partId !== 2 && (
          <div className="mt-3 p-3 bg-gray-50 rounded border text-sm whitespace-pre-wrap">
            {group.passageText}
          </div>
        )}

        <div className="mt-4 space-y-5">
          {group.questions.map((q) => {
            const isFocused = q.questionId === questionId;
            return (
              <div
                key={q.questionId}
                ref={isFocused ? focusedRef : undefined}
                className={`rounded-lg border p-3 ${isFocused && group.partId !== 1 
                  && group.partId !== 2 && group.partId !== 5 ? "ring-2 ring-blue-500" : ""}`}
              >
                {/* Với Part 1 & 2 không có questionText; nếu có transcript bạn có thể hiển thị dưới */}
                {group.partId !== 1 && (
                  <p className="text-gray-800 font-medium mb-2">
                    {q.questionText || ""}
                  </p>
                )}

                <ul className="pl-5 space-y-1 text-sm text-gray-700">
                  {sortOptions(q.options).map((opt) => (
                    <li key={opt.optionId ?? `${q.questionId}-${opt.optionLetter}`}>
                      <strong>{opt.optionLetter}.</strong> {opt.optionText}
                    </li>
                  ))}
                </ul>

                <div className="mt-1 text-sm">
                  <span className="text-green-600 font-semibold">
                    Đáp án đúng: {q.correctAnswerOption}
                  </span>
                </div>

                {/* Với Part 1 có thể xem như transcript */}
                {group.partId === 1 && q.questionText && (
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>Transcript:</strong> {q.questionText}
                  </p>
                )}

                {q.explanation && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Giải thích:</strong> {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <button
          className="absolute top-2 right-3 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
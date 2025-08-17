"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";

interface QuestionComponentProps {
  question: {
    questionId: number;
    questionNumber: number;
    questionText?: string;
    options: { optionId: number; optionLetter: string; optionText?: string }[];
  };
  partNumber: number;
  currentGroup: { questions: any[] };
  answers: Record<number, string>;
  markedForReview: Record<number, boolean>;
  onAnswerChange: (questionId: number, value: string) => void;
  onMarkForReview: (questionId: number) => void;
  isListeningPart?: boolean;
  showMarkForReview?: boolean;
}

export default function QuestionComponent({
  question,
  partNumber,
  currentGroup,
  answers,
  markedForReview,
  onAnswerChange,
  onMarkForReview,
  isListeningPart = false,
  showMarkForReview = true,
}: QuestionComponentProps) {
  const isMarked = markedForReview[question.questionId] ?? false;

  return (
    <div className="border-b border-gray-200 pb-6 last:border-b-0">
      {partNumber >= 3 && question.questionText && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            {question.questionNumber}. {question.questionText}
          </h3>
        </div>
      )}

      <div className="space-y-3">
        {!(partNumber >= 3) && currentGroup.questions.length === 1 && (
          <h3 className="text-lg font-semibold mb-4">
            {partNumber === 1
              ? "Choose the best description for the picture:"
              : "Choose the best response:"}
          </h3>
        )}

        <RadioGroup
          value={answers[question.questionId] || ""}
          onValueChange={(val) => onAnswerChange(question.questionId, val)}
          className="space-y-2"
        >
          {question.options.map((option) => (
            <div
              key={option.optionId}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50"
            >
              <RadioGroupItem
                value={option.optionLetter}
                id={`option-${option.optionId}`}
                className="mt-0.5"
              />
              <Label
                htmlFor={`option-${option.optionId}`}
                className="cursor-pointer text-base flex-1"
              >
                <span className="font-medium text-lg">
                  ({option.optionLetter})
                </span>
                {partNumber >= 3 && (
                  <span className="ml-2">{option.optionText}</span>
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {showMarkForReview && (
          <div className="flex justify-end mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMarkForReview(question.questionId)}
              className={
                isMarked
                  ? "bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200"
                  : "hover:bg-orange-50"
              }
            >
              <Flag
                className={`h-3 w-3 mr-1 ${
                  isMarked ? "text-orange-500" : ""
                }`}
              />
              {isMarked ? "Marked" : "Mark"}
            </Button>
          </div>
        )}

        {isListeningPart && !showMarkForReview && (
          <div className="mt-3 text-xs text-blue-600 text-center">
            <span>Phần thi nghe không được phép đánh dấu câu hỏi</span>
          </div>
        )}
      </div>
    </div>
  );
}
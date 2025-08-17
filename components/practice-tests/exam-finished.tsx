"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getTotalQuestions, getTotalAnswered } from "@/lib/utils";
import { PartData } from "@/types/question";

interface ExamFinishedProps {
  remainingTime: number;
  initialTime: number;
  allAnswers: Record<string, Record<number, string>>;
  partDataCache: Record<string, PartData>;
}

export default function ExamFinished({
  remainingTime,
  initialTime,
  allAnswers,
  partDataCache,
}: ExamFinishedProps) {
  const router = useRouter();

  const totalAnswered = getTotalAnswered(allAnswers);
  const totalQuestions = getTotalQuestions(partDataCache);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow text-center">
        <h2 className="text-2xl font-semibold mb-4">Test Finished</h2>

        {remainingTime === 0 && initialTime > 0 && (
          <p className="text-gray-700 mb-2">Time is up.</p>
        )}

        <div className="text-lg font-medium mb-6">
          You answered {totalAnswered} out of {totalQuestions} questions{" "}
          {totalQuestions > 0 && (
            <span className="text-blue-600">
              ({Math.round((totalAnswered / totalQuestions) * 100)}%)
            </span>
          )}
        </div>

        <div className="space-x-4">
          <Button onClick={() => router.push("/practice-tests")}>
            Back to Tests
          </Button>
          <Button variant="outline" onClick={() => router.push("/progress")}>
            View Progress
          </Button>
        </div>
      </div>
    </div>
  );
}

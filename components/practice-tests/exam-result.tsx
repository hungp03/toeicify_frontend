"use client";

import { CheckCircle, Award, Target, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExamSubmissionResponse } from "@/types";
import dayjs from "dayjs";

interface ExamResultProps {
  isFullExam: boolean;
  result: ExamSubmissionResponse;
  onViewDetails: () => void;
  onRetakeExam: () => void;
}

export default function ExamResult({
  isFullExam,
  result,
  onViewDetails,
  onRetakeExam,
}: ExamResultProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Hoàn thành bài thi!
        </h1>
        <p className="text-gray-600">Kết quả của bạn đã được lưu lại</p>
      </div>
      {isFullExam &&
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="text-center p-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Award className="h-5 w-5 text-yellow-500" />
                <span className="text-lg font-semibold">Tổng điểm</span>
              </div>
              <div className="text-4xl font-bold text-blue-600">
                {result.totalScore}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {result.examSummary.submitType === "full"
                  ? "/990"
                  : "Partial Test"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center p-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Target className="h-5 w-5 text-green-500" />
                <span className="text-lg font-semibold">Listening</span>
              </div>
              <div className="text-4xl font-bold text-green-600">
                {result.listeningScore}
              </div>
              <div className="text-sm text-gray-500 mt-1">/495</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center p-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Target className="h-5 w-5 text-purple-500" />
                <span className="text-lg font-semibold">Reading</span>
              </div>
              <div className="text-4xl font-bold text-purple-600">
                {result.readingScore}
              </div>
              <div className="text-sm text-gray-500 mt-1">/495</div>
            </CardContent>
          </Card>
        </div>
      }
      {/* Completion Info */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5" />
            <span className="text-lg font-semibold">Thông tin hoàn thành</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Thời gian làm bài</div>
              <div className="font-semibold">
                {formatTime(result.completionTimeMinutes)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Loại bài thi</div>
              <div className="font-semibold capitalize">
                {result.examSummary.submitType === "full"
                  ? "Full Exam"
                  : "Partial Exam"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Ngày nộp</div>
              <div className="font-semibold">
                {dayjs(result.submittedAt).format("DD/MM/YYYY")}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Attempt ID</div>
              <div className="font-semibold">#{result.attemptId}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tổng quan</h3>
          <div className="space-y-4">
            {result.partsDetail.map((part, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-semibold">
                    Part {part.partNumber}: {part.partName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {part.correctAnswers} câu trả lời đúng
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={onViewDetails}>
          Xem chi tiết câu trả lời
        </Button>
        <Button onClick={onRetakeExam}>Làm lại bài thi</Button>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";

interface ExamErrorProps {
  error: string;
  onBackToSetup: () => void;
  onRetry: () => void;
}

export default function ExamError({
  error,
  onBackToSetup,
  onRetry,
}: ExamErrorProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <Button variant="ghost" onClick={onBackToSetup} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại thiết lập bài thi
        </Button>

        {/* Error box */}
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Không thể tải bài thi
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>

          <div className="space-x-4">
            <Button onClick={onBackToSetup}>Quay lại thiết lập</Button>
            <Button variant="outline" onClick={onRetry}>
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

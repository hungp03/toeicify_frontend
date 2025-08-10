"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
};

export default function SubmitConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận nộp bài</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <div>Bạn có chắc chắn muốn nộp bài không?</div>

              <div className="text-sm bg-gray-50 p-3 rounded-lg">
                Vui lòng kiểm tra kỹ trước khi nộp và kiểm tra các câu hỏi còn thiếu. Sau khi nộp, bạn sẽ không thể thay đổi câu trả lời.
              </div>

              <div className="text-sm text-red-600">
                Lưu ý: Việc nộp bài sẽ không thể hoàn tác. Hãy chắc chắn rằng bạn đã hoàn thành tất cả các câu hỏi.
              </div>
            </div>
          </AlertDialogDescription>

        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Đang nộp bài..." : "Nộp bài"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { getMissingParts } from "@/lib/api/exam_part";
import { updateExam } from "@/lib/api/exam";
import { type AddMissingPartsDialogProps, type ExamRequest, type MissingPartResponse } from "@/types";

const PART_DESCRIPTIONS: Record<number, string> = {
  1: "Mô tả hình ảnh (Photographs)",
  2: "Hỏi - đáp (Question-Response)",
  3: "Hội thoại ngắn (Conversations)",
  4: "Bài nói ngắn (Talks)",
  5: "Hoàn thành câu (Incomplete Sentences)",
  6: "Hoàn thành đoạn văn (Text Completion)",
  7: "Đọc hiểu (Reading Comprehension)",
}

export function AddMissingPartsDialog({
  open,
  onOpenChange,
  exam,
  onAdded,
}: AddMissingPartsDialogProps) {
  const [loadingMissing, setLoadingMissing] = useState(false);
  const [missingParts, setMissingParts] = useState<MissingPartResponse[]>([]);
  const [selectedMissing, setSelectedMissing] = useState<number[]>([]);

  // Load danh sách part còn thiếu khi mở dialog
  useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (!open) return;
      setSelectedMissing([]);
      setLoadingMissing(true);
      try {
        const res = await getMissingParts(exam.examId);
        if (!ignore) setMissingParts(res.data || []);
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || "Không tải được danh sách part còn thiếu.";
        toast.error(msg);
      } finally {
        if (!ignore) setLoadingMissing(false);
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, [open, exam.examId]);

  const handleAddSelectedParts = async () => {
    if (!selectedMissing.length) {
      toast.error("Vui lòng chọn ít nhất một phần thi.");
      return;
    }

    try {
      const existingParts = (exam.examParts || []).map((p) => ({
        partId: p.partId,
        partNumber: p.partNumber,
        partName: p.partName,
        description: p.description || "",
        questionCount: p.questionCount ?? 0,
      }));

      const toAdd = selectedMissing.map((pn) => {
        const fromMissing = missingParts.find((m) => m.partNumber === pn);
        return {
          partNumber: pn,
          partName: fromMissing?.partName || `Part ${pn}`,
          description: PART_DESCRIPTIONS[pn] || "",
          questionCount: 0,
        };
      });

      const payload: ExamRequest = {
        examName: exam.examName,
        examDescription: exam.examDescription,
        totalQuestions: exam.totalQuestions,
        listeningAudioUrl: exam.listeningAudioUrl,
        categoryId: exam.categoryId,
        examParts: [...existingParts, ...toAdd],
      };

      await updateExam(exam.examId, payload);
      toast.success("Đã thêm phần thi mới.");
      onOpenChange(false);
      onAdded?.(selectedMissing);
      setSelectedMissing([]);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Không thể thêm phần thi.";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Thêm phần thi còn thiếu</DialogTitle>
          <DialogDescription>
            Chọn một hoặc nhiều phần TOEIC chưa có trong đề.
          </DialogDescription>
        </DialogHeader>

        {loadingMissing ? (
          <div className="flex items-center justify-center h-40">
            <Loader className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2">Đang tải danh sách...</span>
          </div>
        ) : missingParts.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            Đề đã có đầy đủ 7 phần. Không còn phần nào để thêm.
          </div>
        ) : (
          <div className="space-y-3 max-h-[320px] overflow-auto pr-1">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedMissing(missingParts.map((m) => m.partNumber))}
              >
                Chọn tất cả
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedMissing([])}>
                Bỏ chọn tất cả
              </Button>
            </div>

            {missingParts
              .sort((a, b) => a.partNumber - b.partNumber)
              .map((mp) => {
                const checked = selectedMissing.includes(mp.partNumber);
                return (
                  <label
                    key={mp.partNumber}
                    className="flex items-start gap-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) =>
                        setSelectedMissing((prev) =>
                          v ? [...prev, mp.partNumber] : prev.filter((n) => n !== mp.partNumber)
                        )
                      }
                    />
                    <div className="flex-1">
                      <div className="font-medium">{mp.partName}</div>
                      <div className="text-sm text-gray-600">{PART_DESCRIPTIONS[mp.partNumber] || "—"}</div>
                      <div className="text-xs text-muted-foreground mt-1">Dự kiến: {mp.expectedQuestionCount} câu</div>
                    </div>
                  </label>
                );
              })}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleAddSelectedParts}
            disabled={loadingMissing || missingParts.length === 0 || selectedMissing.length === 0}
          >
            Thêm đã chọn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

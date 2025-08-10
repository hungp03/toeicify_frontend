"use client";

import * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { ExamInfoEditSchema, type ExamInfoEditFormData } from "@/lib/schema";
import { updateExam, updateExamStatus } from "@/lib/api/exam";
import type { Category } from "@/types/category";
import type { ExamPartVM, ExamRequest } from "@/types";
import { formatDate } from "@/lib/utils";
import { MediaUploader } from "@/components/common/media_uploader";


export function EditExamDialog({
  open,
  onOpenChange,
  examId,
  initial,
  categories,
  onUpdated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  examId: number;
  initial: {
    examName: string;
    examDescription: string;
    totalQuestions: number;
    listeningAudioUrl: string;
    status: "PRIVATE" | "PUBLIC" | "PENDING" | "CANCELLED";
    categoryId: number;
    createdAt: string | null;
    createdByName: string;
    examParts: ExamPartVM[];
  };
  categories: Category[];
  onUpdated?: () => void;
}) {
  const form = useForm<ExamInfoEditFormData>({
    resolver: zodResolver(ExamInfoEditSchema),
    defaultValues: {
      examName: initial.examName,
      examDescription: initial.examDescription,
      totalQuestions: initial.totalQuestions,
      listeningAudioUrl: initial.listeningAudioUrl ?? "",
      status: initial.status,
      categoryId: initial.categoryId,
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (open && initial) {
      reset({
        examName: initial.examName,
        examDescription: initial.examDescription,
        totalQuestions: initial.totalQuestions,
        listeningAudioUrl: initial.listeningAudioUrl ?? "",
        status: initial.status,
        categoryId: initial.categoryId,
      });
    }
  }, [open, initial, reset]);

  const onSubmit = async (values: ExamInfoEditFormData) => {
    try {
      // Build examParts để đáp ứng @NotEmpty của BE
      const partsPayload = (initial.examParts ?? []).map((p) => ({
        partId: p.partId,
        partNumber: p.partNumber,
        partName: p.partName,
        description: p.description ?? "",
        questionCount: p.questionCount ?? 0,
      }));
      if (!partsPayload.length) {
        toast.error("Thiếu danh sách phần thi (examParts). Vui lòng tải lại trang.");
        return;
      }

      // 1) Cập nhật info chung
      const payload: ExamRequest = {
        examName: values.examName,
        examDescription: values.examDescription,
        totalQuestions: values.totalQuestions, // read-only trên UI nhưng BE yêu cầu
        listeningAudioUrl: values.listeningAudioUrl,
        categoryId: values.categoryId,
        examParts: partsPayload,
      };
      await updateExam(examId, payload);

      // 2) Đổi trạng thái nếu có thay đổi — dùng API PATCH + query params đã cho
      if (values.status !== initial.status) {
          await updateExamStatus(examId, values.status); // <— dùng đúng API sẵn có
      }

      toast.success("Cập nhật đề thi thành công");
      onOpenChange(false);
      onUpdated?.();
    } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "Không thể cập nhật đề thi";
        toast.error(msg);
      }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin đề thi</DialogTitle>
          <DialogDescription>
            Sửa tên đề, mô tả, audio, trạng thái và danh mục. Các trường chỉ xem được tô mờ.
          </DialogDescription>
        </DialogHeader>

        {/* Form wrapper của bạn nhận onSubmit(values) */}
        <Form form={form} onSubmit={onSubmit}>
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField name="examName">
                {({ value, onChange, error }) => (
                  <FormItem>
                    <FormLabel>Tên đề</FormLabel>
                    <Input value={value} onChange={onChange} />
                    <FormMessage>{error}</FormMessage>
                  </FormItem>
                )}
              </FormField>

              <FormField name="categoryId">
                {({ value, onChange, error }) => (
                  <FormItem>
                    <FormLabel>Danh mục</FormLabel>
                    <Select value={value?.toString()} onValueChange={(v) => onChange(Number(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.categoryId} value={String(c.categoryId)}>
                            {c.categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage>{error}</FormMessage>
                  </FormItem>
                )}
              </FormField>

              <FormField name="listeningAudioUrl">
                {({ value, onChange, error }) => (
                  <FormItem>
                    {/* Dùng label của MediaUploader để tránh trùng label */}
                    <MediaUploader
                      label="Audio (Listening)"
                      value={value ?? ""}               // luôn controlled
                      onChange={onChange}               // cập nhật vào RHF
                      accept="audio/*"                  // chỉ cho tải audio
                      folder="audios"                   // BE sẽ lưu dưới prefix này
                      placeholder="Dán URL hoặc tải tệp audio"
                      hint="Hỗ trợ: MP3, WAV, OGG, MP4, WEBM"
                      preview="audio"                   // hiển thị player
                    />
                    <FormMessage>{error}</FormMessage>
                  </FormItem>
                )}
              </FormField>

              <FormField name="examDescription">
                {({ value, onChange, error }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Mô tả</FormLabel>
                    <Input value={value} onChange={onChange} />
                    <FormMessage>{error}</FormMessage>
                  </FormItem>
                )}
              </FormField>

              <FormField name="status">
                {({ value, onChange, error }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select value={value} onValueChange={onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRIVATE">PRIVATE</SelectItem>
                        <SelectItem value="PUBLIC">PUBLIC</SelectItem>
                        <SelectItem value="PENDING">PENDING</SelectItem>
                        <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage>{error}</FormMessage>
                  </FormItem>
                )}
              </FormField>

              <FormField name="totalQuestions">
                {({ value, error }) => (
                  <FormItem>
                    <FormLabel>Tổng số câu hỏi</FormLabel>
                    <div className="px-3 py-2 border rounded-md bg-gray-50 text-sm opacity-70 cursor-not-allowed">
                      {value}
                    </div>
                    <FormMessage>{error}</FormMessage>
                  </FormItem>
                )}
              </FormField>
            </div>

            {/* Chỉ xem: createdAt + createdBy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FormLabel>Ngày tạo</FormLabel>
                <div className="px-3 py-2 border rounded-md bg-gray-50 text-sm opacity-70 cursor-not-allowed">
                  {initial.createdAt ? formatDate(initial.createdAt) : "—"}
                </div>
              </div>
              <div>
                <FormLabel>Người tạo</FormLabel>
                <div className="px-3 py-2 border rounded-md bg-gray-50 text-sm opacity-70 cursor-not-allowed">
                  {initial.createdByName || "—"}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit">Lưu</Button>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

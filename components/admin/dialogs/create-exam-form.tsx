"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createExamSchema,
  type CreateExamFormData,
} from "@/lib/schema"; // Đường dẫn tùy vị trí thực tế
import { getAllExamCategoriesList, createExam } from "@/lib/api/exam";
import { Category } from "@/types/category"
import { cn } from "@/lib/utils";
import { ExamPartRequest } from "@/types";
import { MediaUploader } from "@/components/common/media_uploader"; 

export default function CreateExamForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllExamCategoriesList();
        setCategories(res.data || []);
      } catch (err) {
        toast.error("Không thể tải danh mục");
      }
    };
    fetchCategories();
  }, []);

  const form = useForm<CreateExamFormData>({
    resolver: zodResolver(createExamSchema),
    defaultValues: {
      examName: "",
      examDescription: "",
      totalQuestions: 0,
      listeningAudioUrl: "",
      categoryId: undefined,
      examParts: [
        {
          partNumber: 1,
          partName: "Part 1",
          description: "Mô tả hình ảnh (Photographs)",
          questionCount: 0,
          enabled: true,
        },
        {
          partNumber: 2,
          partName: "Part 2",
          description: "Hỏi - đáp (Question-Response)",
          questionCount: 0,
          enabled: true,
        },
        {
          partNumber: 3,
          partName: "Part 3",
          description: "Hội thoại ngắn (Conversations)",
          questionCount: 0,
          enabled: true,
        },
        {
          partNumber: 4,
          partName: "Part 4",
          description: "Bài nói ngắn (Talks)",
          questionCount: 0,
          enabled: true,
        },
        {
          partNumber: 5,
          partName: "Part 5",
          description: "Hoàn thành câu (Incomplete Sentences)",
          questionCount: 0,
          enabled: true,
        },
        {
          partNumber: 6,
          partName: "Part 6",
          description: "Hoàn thành đoạn văn (Text Completion)",
          questionCount: 0,
          enabled: true,
        },
        {
          partNumber: 7,
          partName: "Part 7",
          description: "Đọc hiểu (Reading Comprehension)",
          questionCount: 0,
          enabled: true,
        },
      ],
    },
  });

  const { control, handleSubmit, watch } = form;
  const { fields } = useFieldArray({ control, name: "examParts" });

  const onSubmit = async (data: CreateExamFormData) => {
    const selectedParts = data.examParts.filter((p) => p.enabled);

    try {
      const selectedParts: ExamPartRequest[] = data.examParts
        .filter((p) => p.enabled)
        .map((p) => ({
          ...p,
          description: p.description ?? "",
        }));
      await createExam({
        ...data,
        examParts: selectedParts,
      });
      toast.success("Tạo đề thi thành công");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.message || "Tạo đề thi thất bại");
    }
  };
  

  return (
    <Form form={form} onSubmit={onSubmit}>
      <div className="space-y-4">
        {/* Thông tin cơ bản */}
        <FormField name="examName">
          {({ value, onChange, error }) => (
            <FormItem>
              <FormLabel>Tên đề</FormLabel>
              <Input value={value} onChange={onChange} />
              <FormMessage>{error}</FormMessage>
            </FormItem>
          )}
        </FormField>

        <FormField name="examDescription">
          {({ value, onChange, error }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <Input value={value} onChange={onChange} />
              <FormMessage>{error}</FormMessage>
            </FormItem>
          )}
        </FormField>

        <FormField name="totalQuestions">
          {({ value, error }) => (
            <FormItem>
              <FormLabel>Tổng số câu hỏi</FormLabel>
              <div className="px-3 py-2 border rounded-md bg-gray-50 text-sm text-gray-700">
                {value}
              </div>
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

        <FormField name="categoryId">
          {({ value, onChange, error }) => (
            <FormItem>
              <FormLabel>Danh mục</FormLabel>
              <Select
                value={value?.toString()}
                onValueChange={(val) => onChange(Number(val))}
              >
                <SelectTrigger className="w-[50%]">
                  <SelectValue placeholder="Chọn danh mục đề thi" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.categoryId} value={category.categoryId.toString()}>
                      {category.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage>{error}</FormMessage>
            </FormItem>
          )}
        </FormField>

        {/* Danh sách các phần của đề thi */}
        <div className="flex flex-col gap-3 border-t pt-4">
          {fields.map((field, index) => {
            const enabled = watch(`examParts.${index}.enabled`);
            return (
              <div
                key={field.id}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-lg shadow-sm transition-colors",
                  enabled ? "bg-gray-200" : "bg-gray-100 hover:bg-gray-200/70"
                )}
              >
                {/* Checkbox và nội dung chính */}
                <div className="flex items-start gap-3 w-full">
                  <FormField name={`examParts.${index}.enabled`}>
                    {({ value, onChange }) => (
                      <Checkbox
                        checked={value}
                        onCheckedChange={onChange}
                        className="mt-1"
                      />
                    )}
                  </FormField>

                  <div className="flex flex-col gap-1 w-full">
                    <div className="font-semibold text-base text-gray-800">
                      {field.partName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {field.description}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Button type="submit">Tạo đề</Button>
      </div>
    </Form>
  );
}

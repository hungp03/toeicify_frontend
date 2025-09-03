"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scheduleSchema, ScheduleFormData } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { NewSchedulePayload } from "@/types";

interface CreateScheduleDialogProps {
  onCreateSchedule: (schedule: NewSchedulePayload) => Promise<boolean>;
}

export const CreateScheduleDialog = ({ onCreateSchedule }: CreateScheduleDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
    watch,
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      title: "",
      description: "",
      todos: [{ taskDescription: "", dueDate: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "todos",
  });

  const watchTitle = watch("title");
  const watchTodos = watch("todos");

  const normalizeDate = (input: string | undefined): string => {
    if (!input) return "";
    const date = new Date(input);
    return isNaN(date.getTime()) ? "" : date.toISOString();
  };

  const isValid =
    watchTitle.trim().length > 0 &&
    watchTodos.some((t) => t.taskDescription.trim().length > 0) &&
    Object.keys(errors).length === 0;

  const onSubmit = async (data: ScheduleFormData) => {
    const payload: NewSchedulePayload = {
      title: data.title.trim(),
      description: data.description?.trim() || "",
      todos: data.todos
        .filter((t) => t.taskDescription.trim() !== "" || (t.dueDate?.trim() || "") !== "")
        .map((t) => ({
          taskDescription: t.taskDescription.trim(),
          dueDate: normalizeDate(t.dueDate),
        })),
    };

    const success = await onCreateSchedule(payload);
    if (success) {
      reset();
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isSubmitting) setIsOpen(open);
    }}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500">
          <Plus className="h-4 w-4" />
          Tạo lịch học
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Tạo lịch học mới</DialogTitle>
          <DialogDescription>
            Tạo một lịch học để theo dõi tiến độ học tập
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="mb-2">Tên lịch học *</Label>
            <Input
              id="title"
              placeholder="Ví dụ: Ôn thi Tiếng Anh"
              {...register("title")}
              className={errors.title ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="mb-2">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Kế hoạch ôn thi Tiếng Anh trong ba tháng"
              {...register("description")}
              className={errors.description ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Todos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Các công việc *</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ taskDescription: "", dueDate: "" })}
                className="h-8 px-3"
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4 mr-1" />
                Thêm việc
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
                  {/* Task Description */}
                  <div className="md:col-span-7">
                    <Input
                      placeholder="Mô tả công việc..."
                      {...register(`todos.${index}.taskDescription`)}
                      className={
                        errors.todos?.[index]?.taskDescription ? "border-red-500" : ""
                      }
                      disabled={isSubmitting}
                    />
                    {errors.todos?.[index]?.taskDescription && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.todos[index]?.taskDescription?.message}
                      </p>
                    )}
                  </div>

                  {/* Due Date */}
                  <div className="md:col-span-4">
                    <Input
                      type="datetime-local"
                      min="2025-01-01T00:00"
                      max="2099-12-31T23:59"
                      {...register(`todos.${index}.dueDate`)}
                      className={errors.todos?.[index]?.dueDate ? "border-red-500" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.todos?.[index]?.dueDate && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.todos[index]?.dueDate?.message}
                      </p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <div className="md:col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => remove(index)}
                      className="px-2"
                      disabled={fields.length === 1 || isSubmitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo…
                </>
              ) : (
                "Tạo"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

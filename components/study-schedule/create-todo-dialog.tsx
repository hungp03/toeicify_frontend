"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import type { NewTodoForm } from "@/types";
import { todoSchema, TodoFormData } from "@/lib/schema";
import dayjs from "dayjs";

type Mode = "create" | "edit";

type EditSubmitPayload = {
  todoId: number;
  scheduleId: number;
  title: string;
  description?: string;
  dueDate: string | null;
  isCompleted?: boolean;
};

interface CreateTodoDialogProps {
  mode?: Mode; // default: "create"
  scheduleId: number;
  scheduleTitle: string;
  onCreateTodo: (todo: NewTodoForm) => Promise<boolean>;
  onEditTodoSubmit?: (payload: EditSubmitPayload) => Promise<boolean>;
  initialValues?: {
    todoId: number;
    title: string;
    description?: string;
    dueDate: string | null;   // ISO string hoặc null
    isCompleted: boolean;
  };
}

export const CreateTodoDialog = ({
  mode = "create",
  scheduleId,
  scheduleTitle,
  onCreateTodo,
  onEditTodoSubmit,
  initialValues,
}: CreateTodoDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      scheduleId: "",
      dueDate: "",
    },
  });

  const handleOpenCreate = () => {
    setValue("scheduleId", String(scheduleId));
    setIsOpen(true);
  };

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      const initDue =
        initialValues.dueDate
          ? dayjs(initialValues.dueDate).format("YYYY-MM-DDTHH:mm")
          : "";

      reset({
        title: initialValues.title ?? "",
        scheduleId: String(scheduleId),
        dueDate: initDue,
      });
      setIsOpen(true);
    }
  }, [mode, initialValues, scheduleId, reset]);

  const onSubmit = async (data: TodoFormData) => {
    const due =
      data.dueDate && data.dueDate !== ""
        ? dayjs(data.dueDate).format("YYYY-MM-DDTHH:mm:ss")
        : null;

    if (mode === "edit" && initialValues && onEditTodoSubmit) {
      const ok = await onEditTodoSubmit({
        todoId: initialValues.todoId,
        scheduleId: Number(scheduleId),
        title: data.title.trim(),
        dueDate: due,
        isCompleted: initialValues.isCompleted,
      });
      if (ok) {
        reset();
        setIsOpen(false);
      }
      return;
    }

    // Tạo mới (create)
    const trimmedFormData: NewTodoForm = {
      title: data.title.trim(),
      scheduleId: String(scheduleId), 
      dueDate: due,
    };

    const success = await onCreateTodo(trimmedFormData);
    if (success) {
      reset();
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    reset();
  };

  const isEdit = mode === "edit";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={handleOpenCreate}
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm nhiệm vụ
          </Button>
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Cập nhật nhiệm vụ" : "Thêm nhiệm vụ mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Chỉnh sửa nhiệm vụ trong lịch học "${scheduleTitle}"`
              : `Thêm nhiệm vụ vào lịch học "${scheduleTitle}"`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="todo-title" className="mb-2">
                Tên nhiệm vụ *
              </Label>
              <Input
                id="todo-title"
                {...register("title")}
                placeholder="Ví dụ: Hoàn thành bài tập số một"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="todo-dueDate" className="mb-2">
                Hạn chót (tùy chọn)
              </Label>
              <Input
                id="todo-dueDate"
                type="datetime-local"
                {...register("dueDate")}
                className={errors.dueDate ? "border-red-500" : ""}
              />
              {errors.dueDate && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.dueDate.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500"
              disabled={!isValid}
            >
              {isEdit ? "Lưu thay đổi" : "Thêm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

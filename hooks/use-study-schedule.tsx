"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createNewSchedule, getStudySchedules, deleteStudySchedule, createSingleTodo, updateSingleTodo, setCompletion, deleteTodoItem } from "@/lib/api/study-schedule";
import type { StudySchedule, TodoItem, NewSchedulePayload, NewTodoForm, NewTodoPayload } from "@/types";

export const useStudySchedule = () => {
  const [schedules, setSchedules] = useState<StudySchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const loadSchedules = async (page = currentPage, size = 6, sort = "createdAt,desc") => {
    try {
      setLoading(true);
      const data = await getStudySchedules(page + 1, size, sort);
      setSchedules(data?.result);
      setCurrentPage(data?.meta?.page);
      setTotalPages(data?.meta?.pages);
    } catch (err) {
      toast.error("Không thể tải lịch học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const createSchedule = async (newSchedule: NewSchedulePayload): Promise<boolean> => {
    if (!newSchedule.title.trim()) {
      toast.warning("Vui lòng nhập tên lịch học");
      return false;
    }

    try {
      await createNewSchedule(newSchedule);
      loadSchedules(0);
      toast.success("Đã tạo lịch học mới");
      return true;
    } catch (error) {
      toast.error("Không thể tạo lịch học");
      return false;
    }
  };

  const createTodo = async (newTodo: NewTodoForm): Promise<boolean> => {
    if (!newTodo.title.trim() || !newTodo.scheduleId) {
      toast.warning("Vui lòng nhập đầy đủ thông tin");
      return false;
    }

    const payload: NewTodoPayload = {
      scheduleId: Number(newTodo.scheduleId),
      taskDescription: newTodo.title.trim(),
      dueDate: typeof newTodo.dueDate === "string" || newTodo.dueDate === null ? newTodo.dueDate : null,
    };

    try {
      const res = await createSingleTodo(payload);
      console.log(res)
      setSchedules((prev) =>
        prev.map((s) =>
          s.scheduleId === res.scheduleId
            ? {
              ...s,
              todos: [
                ...s.todos,
                {
                  todoId: res.todoId,
                  taskDescription: res.taskDescription,
                  isCompleted: res.isCompleted,
                  dueDate: res.dueDate, // string | null
                } as TodoItem,
              ],
            }
            : s
        )
      );

      toast.success("Đã thêm nhiệm vụ mới");
      return true;
    } catch (err: any) {
      toast.error("Không thể tạo nhiệm vụ. Vui lòng thử lại.");
      return false;
    }
  };

  const editTodo = async (
    scheduleId: number,
    updatedTodo: TodoItem
  ): Promise<boolean> => {
    if (!updatedTodo.taskDescription.trim() || !scheduleId) {
      toast.warning("Vui lòng nhập đầy đủ thông tin");
      return false;
    }

    const payload: Partial<NewTodoPayload> = {
      taskDescription: updatedTodo.taskDescription.trim(),
      dueDate:
        typeof updatedTodo.dueDate === "string" || updatedTodo.dueDate === null
          ? updatedTodo.dueDate
          : null
    };

    try {
      const res = await updateSingleTodo(updatedTodo.todoId, payload);
      console.log(res);

      setSchedules((prev) =>
        prev.map((s) =>
          s.scheduleId === res.scheduleId
            ? {
              ...s,
              todos: s.todos.map((t) =>
                t.todoId === res.todoId
                  ? {
                    ...t,
                    taskDescription: res.taskDescription,
                    isCompleted: res.isCompleted,
                    dueDate: res.dueDate,
                  }
                  : t
              ),
            }
            : s
        )
      );

      toast.success("Đã cập nhật nhiệm vụ");
      return true;
    } catch (err: any) {
      toast.error("Không thể cập nhật nhiệm vụ. Vui lòng thử lại.");
      return false;
    }
  };


  const toggleTodo = async (scheduleId: number, todoId: number): Promise<void> => {
    const schedule = schedules.find(s => s.scheduleId === scheduleId);
    const todo = schedule?.todos.find(t => t.todoId === todoId);

    if (todo) {
      try {
        await setCompletion(todoId, !todo.isCompleted);
        setSchedules((prev) =>
          prev.map((schedule) =>
            schedule.scheduleId === scheduleId
              ? {
                ...schedule,
                todos: schedule.todos.map((todo) =>
                  todo.todoId === todoId
                    ? { ...todo, isCompleted: !todo.isCompleted }
                    : todo
                ),
              }
              : schedule
          )
        );
        toast.success("Cập nhật trạng thái thành công");
      }
      catch (error) {
        toast.error("Không thể cập nhật trạng thái. Hãy thử lại sau.");
      }
    }
  };

  const deleteSchedule = async (scheduleId: number): Promise<void> => {
    try {
      await deleteStudySchedule(scheduleId);
      await loadSchedules(0);
      toast.success("Đã xóa lịch học");
    } catch (error) {
      toast.error("Không thể xóa lịch học. Hãy thử lại sau.");
    }
  };

  const deleteTodo = async (scheduleId: number, todoId: number): Promise<void> => {
    try {
      await deleteTodoItem(todoId);
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.scheduleId === scheduleId
            ? {
              ...schedule,
              todos: schedule.todos.filter((todo) => todo.todoId !== todoId),
            }
            : schedule
        )
      );
      toast.success("Đã xóa nhiệm vụ");
    }
    catch (error) {
      toast.error("Không thể xóa nhiệm vụ. Hãy thử lại sau.");
    }
  }

  const getCompletionRate = (todos: TodoItem[]): number => {
    if (todos.length === 0) return 0;
    const completed = todos.filter((todo) => todo.isCompleted).length;
    return Math.round((completed / todos.length) * 100);
  };

  return {
    schedules,
    loading,
    currentPage,
    totalPages,
    loadSchedules,
    createSchedule,
    createTodo,
    editTodo,
    toggleTodo,
    deleteSchedule,
    deleteTodo,
    getCompletionRate,
  };
};

"use client";
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudySchedule } from '@/hooks/use-study-schedule';
import { StudyScheduleHeader } from './study-schedule-header';
import { CreateScheduleDialog } from './create-schedule-dialog';
import { CreateTodoDialog } from './create-todo-dialog';
import { DeleteConfirmDialog } from './delete-confirm-dialog';
import { EmptyState } from './empty-state';
import { ScheduleCard } from './schedule-card';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { LogIn, GraduationCap } from 'lucide-react';
import { Pagination } from '@/components/common/pagination';
import { TodoItem } from '@/types';
export default function StudySchedulePage() {
    const router = useRouter();
    const {
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
        getCompletionRate
    } = useStudySchedule();

    const user = useAuthStore((state) => state.user);
    const hasHydrated = useAuthStore((state) => state.hasHydrated);
    const isFetchingUser = useAuthStore((state) => state.isFetchingUser);
    const isAuthenticated = !!user;
    const loginToastShown = useRef(false);

    const [editing, setEditing] = useState<{
        scheduleId: number;
        scheduleTitle: string;
        todo: TodoItem;
    } | null>(null);

    const [scheduleToDelete, setScheduleToDelete] = useState<{
        id: number;
        title: string;
    } | null>(null);


    const openEdit = (scheduleId: number, todo: TodoItem) => {
        const s = schedules.find(x => x.scheduleId === scheduleId);
        setEditing({
            scheduleId,
            scheduleTitle: s?.title ?? "",
            todo,
        });
    };

    const closeEdit = () => setEditing(null);

    useEffect(() => {
        if (hasHydrated && !isFetchingUser && !isAuthenticated && !loginToastShown.current) {
            loginToastShown.current = true;
        }
    }, [hasHydrated, isFetchingUser, isAuthenticated]);

    if (!hasHydrated || isFetchingUser) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <Card className="w-full max-w-md animate-pulse">
                    <CardHeader>
                        <div className="h-6 w-40 bg-gray-200 rounded mb-2" />
                        <div className="h-4 w-64 bg-gray-200 rounded" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-10 w-full bg-gray-200 rounded" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Lịch học cá nhân
                        </CardTitle>
                        <CardDescription>
                            Vui lòng đăng nhập để xem và đồng bộ dữ liệu lịch học của bạn.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-3">
                        <Button className="w-full bg-blue-600 hover:bg-blue-500" onClick={() => router.push('/login')}>
                            <LogIn className="h-4 w-4 mr-2" />
                            Đăng nhập
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <StudyScheduleHeader />
                <CreateScheduleDialog onCreateSchedule={createSchedule} />
            </div>

            {loading ? (
                <p>Đang tải lịch học...</p>
            ) : schedules.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {schedules.map((schedule) => (
                            <ScheduleCard
                                key={schedule.scheduleId}
                                schedule={schedule}
                                completionRate={getCompletionRate(schedule.todos)}
                                onToggleTodo={(scheduleId, todoId) =>
                                    toggleTodo(Number(scheduleId), Number(todoId))
                                }
                                onDeleteSchedule={(scheduleId) => {
                                    const schedule = schedules.find(s => s.scheduleId === scheduleId);
                                    if (schedule) {
                                        setScheduleToDelete({
                                            id: schedule.scheduleId,
                                            title: schedule.title,
                                        });
                                    }
                                }}

                                onEditTodo={(scheduleId, todo) => openEdit(Number(scheduleId), todo)}
                                onDeleteTodo={(scheduleId, todoId) =>
                                    deleteTodo(Number(scheduleId), Number(todoId))
                                }
                                onCreateTodo={createTodo}
                            />
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center">
                            <Pagination
                                totalPages={totalPages}
                                currentPage={currentPage - 1}
                                onPageChange={(page) => loadSchedules(page)}
                            />
                        </div>)}
                </>
            )}
            {editing && (
                <CreateTodoDialog
                    key={editing.todo.todoId}
                    mode="edit"
                    scheduleId={editing.scheduleId}
                    scheduleTitle={editing.scheduleTitle}
                    initialValues={{
                        todoId: editing.todo.todoId,
                        title: editing.todo.taskDescription,
                        dueDate: editing.todo.dueDate ?? null,
                        isCompleted: editing.todo.isCompleted,
                    }}
                    onCreateTodo={createTodo}
                    onEditTodoSubmit={async (p) => {
                        const ok = await editTodo(p.scheduleId, {
                            todoId: p.todoId,
                            taskDescription: p.title.trim(),
                            isCompleted: p.isCompleted ?? editing.todo.isCompleted,
                            dueDate: p.dueDate,
                        } as TodoItem);
                        if (ok) closeEdit();
                        return ok;
                    }}
                />
            )}
            {scheduleToDelete && (
                <DeleteConfirmDialog
                    open={!!scheduleToDelete}
                    onCancel={() => setScheduleToDelete(null)}
                    onConfirm={() => {
                        deleteSchedule(scheduleToDelete.id);
                        setScheduleToDelete(null);
                    }}
                    title={`Xác nhận xóa lịch "${scheduleToDelete.title}"`}
                    message="Bạn có chắc muốn xóa? Các nhiệm vụ đi kèm cũng sẽ bị xóa vĩnh viễn."
                />
            )}
        </div>
    );
}
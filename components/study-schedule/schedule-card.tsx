import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { TodoItem } from './todo-item';
import { CreateTodoDialog } from './create-todo-dialog';
import type { StudySchedule, NewTodoForm, TodoItem as TodoItemType } from '@/types';

interface ScheduleCardProps {
  schedule: StudySchedule;
  completionRate: number;
  onToggleTodo: (scheduleId: number, todoId: number) => void;
  onDeleteSchedule: (scheduleId: number) => void;
  onEditTodo: (scheduleId: number, todo: TodoItemType) => void;
  onDeleteTodo: (scheduleId: number, todoId: number) => void;
  onCreateTodo: (todo: NewTodoForm) => Promise<boolean>;
}

export const ScheduleCard = ({
  schedule,
  completionRate,
  onToggleTodo,
  onDeleteSchedule,
  onEditTodo,
  onDeleteTodo,
  onCreateTodo
}: ScheduleCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div>
              <CardTitle className="text-lg">{schedule.title}</CardTitle>
              <CardDescription className="mt-1">
                {schedule.description}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteSchedule(schedule.scheduleId)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Badge variant="secondary">
            {schedule.todos.length} nhiệm vụ
          </Badge>
          <span className="text-sm text-muted-foreground">
            {completionRate}% hoàn thành
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {schedule.todos.map((todo) => (
            <TodoItem
              key={todo.todoId}
              todo={todo}
              onToggle={() => onToggleTodo(schedule.scheduleId, todo.todoId)}
              onEdit={() => onEditTodo(schedule.scheduleId, todo)}
              onDelete={() => onDeleteTodo(schedule.scheduleId, todo.todoId)}
            />
          ))}

          <CreateTodoDialog
            scheduleId={schedule.scheduleId}
            scheduleTitle={schedule.title}
            onCreateTodo={onCreateTodo}
          />
        </div>
      </CardContent>
    </Card>
  );
};
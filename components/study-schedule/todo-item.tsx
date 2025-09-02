import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2 } from 'lucide-react';
import type { TodoItem as TodoItemType } from '@/types';

interface TodoItemProps {
  todo: TodoItemType;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const TodoItem = ({ todo, onToggle, onEdit, onDelete }: TodoItemProps) => {
  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 group">
      <Checkbox
        checked={todo.isCompleted}
        onCheckedChange={onToggle}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${todo.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
          }`}>
          {todo.taskDescription}
        </p>
        {todo.dueDate && (
          <p className="text-xs text-muted-foreground mt-1">
            Hạn chót: {new Date(todo.dueDate).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}

      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        className="opacity-0 group-hover:opacity-100 text-primary hover:text-blue-600 p-1 h-auto"
      >
        <Edit className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive p-1 h-auto"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
};
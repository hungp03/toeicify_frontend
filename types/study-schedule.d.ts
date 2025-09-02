export interface TodoItem {
  todoId: number;
  taskDescription: string;
  isCompleted: boolean;
  dueDate?: string | null; // ISO string
}

export interface StudySchedule {
  scheduleId: number;
  title: string;
  description: string;
  createdAt: string;  // ISO string
  updatedAt: string;
  userId: number;
  todos: TodoItem[];
}

export type NewSchedulePayload = {
  title: string;
  description: string;
  todos: {
    taskDescription: string;
    dueDate: string;
  }[];
};

export interface NewTodoForm {
  dueDate: any;
  title: string;
  scheduleId: string;
}

export type NewTodoPayload = {
  scheduleId: number;
  taskDescription: string;
  dueDate?: string | null; // ISO string
};
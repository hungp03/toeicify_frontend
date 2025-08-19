import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import dayjs from "dayjs"
import "dayjs/locale/vi"
import { PartData } from '@/types/question';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return dayjs(date).isValid() ? dayjs(date).format('DD/MM/YYYY') : ''
}

export function toUtcNoMsZ(d: Date) {
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

// Helper function để validate part data có câu hỏi hay không
export const validatePartData = (partData: PartData): boolean => {
  if (!partData || !partData.groups || partData.groups.length === 0) {
    return false;
  }

  // Kiểm tra xem có ít nhất 1 group có câu hỏi
  const hasQuestions = partData.groups.some(group =>
    group.questions && group.questions.length > 0
  );

  return hasQuestions;
};

// Helper function để tính tổng số câu hỏi
export const getTotalQuestions = (partDataCache: Record<string, PartData>): number => {
  return Object.values(partDataCache).reduce(
    (total, partData) =>
      total +
      partData.groups.reduce(
        (groupTotal, group) => groupTotal + group.questions.length,
        0
      ),
    0
  );
};

// Helper function để tính tổng số câu đã trả lời
export const getTotalAnswered = (allAnswers: Record<string, Record<number, string>>): number => {
  return Object.values(allAnswers).reduce(
    (total, partAnswers) => total + Object.keys(partAnswers).length,
    0
  );
};

// Helper function để format thời gian
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
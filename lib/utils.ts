import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import dayjs from "dayjs"
import "dayjs/locale/vi"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return dayjs(date).isValid() ? dayjs(date).format('DD/MM/YYYY') : ''
}
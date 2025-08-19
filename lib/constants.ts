import { BarChart3, Users, FolderTree, FileText, Home, MessageCircle } from 'lucide-react';

export const navItems = [
  { name: "Trang chủ", path: "/" },
  { name: "Luyện tập", path: "/practice-tests" },
  { name: "Flashcards", path: "/flashcards" },
  { name: "Tiến độ", path: "/progress" },
];

export const adminMenuItems = [
  { name: 'Tổng quan', path: '/admin', icon: BarChart3 },
  { name: 'Quản lý người dùng', path: '/admin/users', icon: Users },
  { name: 'Phân loại đề thi', path: '/admin/categories', icon: FolderTree },
  { name: 'Quản lý đề thi', path: '/admin/tests', icon: FileText },
  { name: 'Quản lý phản hồi', path: '/admin/feedbacks', icon: MessageCircle },
  { name: "Trang chủ", path: "/", icon: Home },
];

export enum ErrorCode {
  EXCEPTION = 1,
  BAD_CREDENTIALS = 2,
  RESOURCE_NOT_FOUND = 3,
  UNAUTHORIZED = 4,
  RESOURCE_INVALID = 5,
  RESOURCE_ALREADY_EXISTS = 6,
  METHOD_NOT_VALID = 7
}


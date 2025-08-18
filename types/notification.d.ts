
export interface NotificationItem {
  id: number
  userId: number
  title: string
  content: string
  isRead: boolean
  createdAt: string
  readAt?: string | null
}
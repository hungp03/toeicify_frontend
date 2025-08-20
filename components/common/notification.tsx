'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check, Trash2, ChevronDown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead, deleteAllNotifications, deleteNotification } from '@/lib/api/notification'
import { NotificationItem } from '@/types'

const formatTimeAgo = (dateString: string) => {
  const now = new Date()
  const createdAt = new Date(dateString + "Z")

  const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60))
  if (diffInMinutes < 1) return 'Vừa xong'
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} giờ trước`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} ngày trước`

  return createdAt.toLocaleDateString('vi-VN')
}


const Notification = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [meta, setMeta] = useState({
    page: 1,
    pageSize: 20,
    pages: 1,
    total: 0
  })

  const fetchNotifications = async (page = 0, append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      const response: any = await getNotifications(page, 20);
      if (response.success) {
        const { result, meta } = response.data
        if (append) {
          setNotifications(prev => [...prev, ...result])
        } else {
          setNotifications(result)
        }
        setMeta(meta)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id)
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      )
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleDeleteNotification = async (id: number) => {
    try {
      await deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      setMeta(prev => ({ ...prev, total: prev.total - 1 }))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const handleDeleteAllNotifications = async () => {
    try {
      await deleteAllNotifications()
      setNotifications([])
      setMeta(prev => ({ ...prev, total: 0, pages: 1 }))
    } catch (error) {
      console.error('Error deleting all notifications:', error)
    }
  }

  const loadMore = () => {
    if (meta.page < meta.pages && !loadingMore) {
      fetchNotifications(meta.page + 1, true)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length
  const hasMore = meta.page < meta.pages

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[500px]">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Thông báo ({meta.total})</span>

          <div className="flex space-x-2">
            {/* Reload button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchNotifications()}
              className="text-xs"
              disabled={loading}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Tải lại
            </Button>
            {notifications.length > 0 && (
              <>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Đánh dấu tất cả
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteAllNotifications}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Xóa tất cả
                </Button>
              </>
            )}
          </div>

        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Đang tải...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Không có thông báo</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="p-3 cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  !notification.isRead && markAsRead(notification.id)
                }
              >
                <div className="flex items-start space-x-3 w-full">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${notification.isRead ? 'bg-gray-300' : 'bg-blue-500'
                      }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${notification.isRead
                            ? 'text-gray-600'
                            : 'text-gray-900'
                            }`}
                        >
                          {notification.title}
                        </p>
                        <p
                          className={`text-xs ${notification.isRead
                            ? 'text-gray-500'
                            : 'text-gray-700'
                            }`}
                        >
                          {notification.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            className="h-6 w-6 p-0 hover:bg-gray-200"
                            title="Đánh dấu đã đọc"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteNotification(notification.id)
                          }}
                          className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
                          title="Xóa thông báo"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}

            {hasMore && (
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="w-full text-blue-600 hover:text-blue-700"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Xem thêm ({meta.total - notifications.length} còn lại)
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Notification

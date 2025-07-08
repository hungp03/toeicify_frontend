'use client'

import { useState } from 'react'
import { Bell, X, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Notification {
  id: number
  title: string
  message: string
  time: string
  isRead: boolean
}

const Notification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Test Completed',
      message: 'You have completed TOEIC Practice Test #1',
      time: '2 minutes ago',
      isRead: false,
    },
    {
      id: 2,
      title: 'New Study Set',
      message: 'New vocabulary set has been added to your library',
      time: '1 hour ago',
      isRead: false,
    },
    {
      id: 3,
      title: 'Daily Goal',
      message: 'You reached your daily study goal!',
      time: '3 hours ago',
      isRead: true,
    },
    {
      id: 4,
      title: 'Progress Update',
      message: 'Your TOEIC score has improved by 15 points',
      time: '1 day ago',
      isRead: false,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const deleteAllNotifications = () => {
    setNotifications([])
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={deleteAllNotifications}
                className="text-xs text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
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
                    className={`w-2 h-2 rounded-full mt-2 ${
                      notification.isRead ? 'bg-gray-300' : 'bg-blue-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            notification.isRead
                              ? 'text-gray-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p
                          className={`text-xs ${
                            notification.isRead
                              ? 'text-gray-500'
                              : 'text-gray-700'
                          }`}
                        >
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.time}
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
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Notification

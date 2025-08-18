'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import UserDropdownMobile from "@/components/common/user-dropdown-mobile"
import Notification from "@/components/common/notification"
import { useAuthStore } from "@/store/auth"
import { useEffect, useState } from 'react'

const AuthSectionMobile = () => {
  const user = useAuthStore((state) => state.user)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const isFetchingUser = useAuthStore((state) => state.isFetchingUser)

  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (hasHydrated && !isFetchingUser) {
      setReady(true)
    }
  }, [hasHydrated, isFetchingUser])

  if (!ready) {
    return (
      <div className="space-y-3 animate-pulse mt-4">
        <div className="h-10 bg-gray-200 rounded-md" />
        <div className="h-10 bg-gray-200 rounded-md" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-3">
        <Link href="/login">
          <Button variant="outline" className="w-full">Đăng nhập</Button>
        </Link>
        <Link href="/register">
          <Button className="w-full bg-blue-600 hover:bg-blue-500 mt-3">Đăng ký</Button>
        </Link>
      </div>
    )
  }

  return <UserDropdownMobile />
}

export default AuthSectionMobile

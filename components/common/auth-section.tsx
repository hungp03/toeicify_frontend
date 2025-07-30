'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import UserDropdown from "@/components/common/user-dropdown"
import { useAuthStore } from "@/store/auth"
import { useEffect, useState } from 'react'

const AuthSection = () => {
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
      <div className="flex space-x-2 animate-pulse">
        <div className="h-9 w-20 rounded-md bg-gray-200" />
        <div className="h-9 w-20 rounded-md bg-gray-200" />
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <Link href="/login">
          <Button variant="outline" size="sm">Đăng nhập</Button>
        </Link>
        <Link href="/register">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500">Đăng ký</Button>
        </Link>
      </>
    )
  }

  return <UserDropdown />
}

export default AuthSection

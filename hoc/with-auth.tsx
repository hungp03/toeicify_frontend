"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth"
import FullPageLoader from "@/components/common/full-page-loader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Lock, User, ArrowRight, Eye } from "lucide-react"

export default function withAuth<P extends Record<string, any> = {}>(
  WrappedComponent: React.ComponentType<P>
) {
  return function AuthWrapper(props: P) {
    const router = useRouter()
    const user = useAuthStore((state) => state.user)
    const hasHydrated = useAuthStore((state) => state.hasHydrated)
    const isFetchingUser = useAuthStore((state) => state.isFetchingUser);
    const [shouldShowPrompt, setShouldShowPrompt] = useState(false)
    const [isAnimated, setIsAnimated] = useState(false)

    useEffect(() => {
      if (hasHydrated && !user) {
        setShouldShowPrompt(true)
        setTimeout(() => setIsAnimated(true), 100)
      }
    }, [hasHydrated, user])

    if (!hasHydrated || isFetchingUser) return <FullPageLoader />

    if (!user) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-8">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          </div>

          <div
            className={`relative max-w-md w-full transition-all duration-700 ${isAnimated ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-600 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <Eye className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Yêu cầu đăng nhập</h2>
                  <p className="text-gray-600 leading-relaxed">
                 Vui lòng đăng nhập để sử dụng tính năng này.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/login")}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-indigo-500 hover:to-blue-500 text-white font-medium py-3 rounded-lg hover:cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Đăng nhập ngay
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => router.push("/register")}
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg transition-all duration-200 hover:cursor-pointer"
                  >
                    Chưa có tài khoản? Đăng ký
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    return <WrappedComponent {...props} />
  }
}

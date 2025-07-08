"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Home, Clock, Shield, HelpCircle, ArrowLeft } from "lucide-react"
import {withAuthRedirectProtection} from "@/hoc/with-auth-redirect"
const AuthFailed = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    const started = sessionStorage.getItem('auth_flow_started');
    if (started !== 'true') {
      router.replace('/login'); 
    } else {
      sessionStorage.removeItem('auth_flow_started');
    }
  }, []);
  const reason = searchParams.get("reason") || "unknown"

  useEffect(() => {
    setTimeout(() => setIsAnimated(true), 100)
  }, [])

  const getErrorMessage = (reason: string) => {
    switch (reason) {
      case "expired":
        return {
          title: "Liên kết đã hết hạn",
          description: "Liên kết xác thực đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực mới.",
          icon: <Clock className="w-12 h-12 text-orange-500" />,
        }
      case "invalid":
        return {
          title: "Liên kết không hợp lệ",
          description: "Liên kết xác thực không đúng hoặc đã bị thay đổi. Vui lòng kiểm tra lại email.",
          icon: <Shield className="w-12 h-12 text-red-500" />,
        }
      case "used":
        return {
          title: "Liên kết đã được sử dụng",
          description: "Tài khoản của bạn có thể đã được xác thực trước đó. Thử đăng nhập để kiểm tra.",
          icon: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
        }
      default:
        return {
          title: "Xác thực thất bại",
          description: "Đã xảy ra lỗi trong quá trình xác thực tài khoản. Vui lòng thử lại.",
          icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
        }
    }
  }

  const errorInfo = getErrorMessage(reason)

  return (
    <div className="min-h-screen bg-gradient-to-br  from-blue-50 to-blue-100 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400/10 to-orange-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-400/10 to-yellow-400/10 rounded-full blur-3xl"></div>
      </div>

      <div
        className={`relative max-w-lg w-full transition-all duration-700 ${
          isAnimated ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center shadow-lg">
                {errorInfo.icon}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">{errorInfo.title}</h1>
              <p className="text-gray-600 leading-relaxed">{errorInfo.description}</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2 text-yellow-800">
                <HelpCircle className="w-4 h-4" />
                <span className="font-medium text-sm">Nguyên nhân thường gặp:</span>
              </div>
              <ul className="text-xs text-yellow-700 space-y-1 text-left">
                <li>• Liên kết đã hết hạn</li>
                <li>• Liên kết đã được sử dụng trước đó</li>
                <li>• Quy trình xác thực bị hủy bỏ</li>
                <li>• Tài khoản đã được xác thực</li>
              </ul>
            </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 py-2 rounded-lg transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Đăng nhập
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 py-2 rounded-lg transition-all duration-200"
                >
                  <Home className="w-4 h-4 mr-1" />
                  Trang chủ
                </Button>
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default withAuthRedirectProtection(AuthFailed);

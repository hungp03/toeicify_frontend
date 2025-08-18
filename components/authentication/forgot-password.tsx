"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot, REGEXP_ONLY_DIGITS_AND_CHARS } from "@/components/ui/input-otp"
import { BookOpen, Mail, Lock, ArrowLeft, Eye, EyeOff, Shield } from "lucide-react"
import { forgotPassword, verifyOtp, resetPassword } from "@/lib/api/auth"
import FullPageLoader from "@/components/common/full-page-loader"
import { toast } from "sonner"
import { ErrorCode } from "@/lib/constants"

type Step = "email" | "otp" | "reset"

// Main component logic - KHÔNG có HOC
export function ForgotPasswordContent() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [identifyCode, setIdentifyCode] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    identifyCode: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [resendTimer, setResendTimer] = useState(0)

  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    try {
      setLoading(true)
      await forgotPassword(email)
      toast.success("Mã OTP mới đã được gửi")
      setResendTimer(60)
    } catch (error) {
      toast.error("Không thể gửi lại OTP, vui lòng thử lại sau")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [resendTimer])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await forgotPassword(email)
      toast.success("Mã xác thực đã được gửi đến email của bạn.")
      setCurrentStep("otp")
    } catch (error: any) {
      if (error.code === ErrorCode.RESOURCE_NOT_FOUND) {
        toast.error("Email không tồn tại. Vui lòng kiểm tra lại.")
      } else {
        toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length === 6) {
      try {
        setLoading(true)
        const res = await verifyOtp(email, otp)
        setIdentifyCode(res.data?.identifyCode)
        toast.success("Xác thực thành công. Vui lòng đặt lại mật khẩu.")
        setCurrentStep("reset")
      } catch (error: any) {
        if (error.code === ErrorCode.RESOURCE_INVALID) {
          toast.error("Mã xác thực không hợp lệ. Vui lòng kiểm tra lại.")
        } else {
          toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.")
        }
      } finally {
        setLoading(false)
      }
    }
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.newPassword === formData.confirmPassword) {
      try {
        setLoading(true)
        await resetPassword(email, formData.newPassword, formData.confirmPassword, identifyCode)
        toast.success("Mật khẩu đã được đặt lại thành công.")
        router.push("/login")
      } catch (error: any) {
        if (error.code === ErrorCode.RESOURCE_INVALID) {
          toast.error("Mã xác thực không hợp lệ hoặc đã hết hạn.")
        } else {
          toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.")
        }
      } finally {
        setLoading(false)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleOtpChange = (value: string) => {
    const filteredValue = value.replace(/[^A-Za-z0-9]/g, "")
    setOtp(filteredValue)
  }

  const renderEmailStep = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Quên mật khẩu?</CardTitle>
        <CardDescription className="text-center">Nhập email của bạn để nhận mã xác thực</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Nhập email của bạn"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-500">
            Gửi mã xác thực
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center space-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại đăng nhập</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  )

  const renderOtpStep = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Xác minh mã</CardTitle>
        <CardDescription className="text-center">Chúng tôi đã gửi mã gồm 6 ký tự tới {email}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={handleOtpChange} pattern={REGEXP_ONLY_DIGITS_AND_CHARS.source}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Chỉ chấp nhận chữ cái và số (A-Z, 0-9)</span>
            </div>

            {otp && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Đã nhập: <span className="font-mono font-semibold">{otp}</span> ({otp.length}/6)
                </p>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-500" disabled={otp.length !== 6}>
            Xác nhận mã
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendTimer > 0}
            className={`text-sm font-medium ${resendTimer > 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:text-blue-500"
              }`}
          >
            {resendTimer > 0
              ? `Gửi lại OTP sau ${resendTimer}s`
              : "Chưa nhận được mã? Gửi lại"}
          </button>
          <div>
            <button
              type="button"
              onClick={() => setCurrentStep("email")}
              className="text-sm font-medium text-gray-600 hover:text-gray-500 flex items-center justify-center space-x-1 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Đổi email khác</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderResetStep = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Đặt lại mật khẩu</CardTitle>
        <CardDescription className="text-center">Nhập mật khẩu mới bên dưới</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleResetSubmit} className="space-y-6">
          <div>
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                className="pl-10 pr-10"
                required
                placeholder="Nhập mật khẩu mới"
                value={formData.newPassword}
                onChange={handleInputChange}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="pl-10 pr-10"
                required
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>
          {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
            <p className="text-sm text-red-600">Mật khẩu không khớp</p>
          )}
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-500"
            disabled={
              !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword
            }
          >
            Xác nhận đặt lại mật khẩu
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center space-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại đăng nhập</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      {loading && <FullPageLoader />}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl space-y-8">
          <div className="text-center">
            <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Toeicify</span>
            </Link>
          </div>
          {currentStep === "email" && renderEmailStep()}
          {currentStep === "otp" && renderOtpStep()}
          {currentStep === "reset" && renderResetStep()}
        </div>
      </div>
    </>
  )
}

export function ForgotPasswordWrapper() {
  return <ForgotPasswordContent />
}
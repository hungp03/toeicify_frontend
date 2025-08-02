"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, Mail, Lock, Eye, EyeOff, User } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterFormData } from "@/lib/schema"
import { apiRegister } from "@/lib/api/auth"
import { toast } from "sonner"
import { ErrorCode } from "@/lib/constants"
import FullPageLoader from "@/components/common/full-page-loader"
import TermsModal from "@/components/common/terms"
import PrivacyPolicy from "@/components/common/privacy"

// Main component logic - KHÔNG có HOC
export function RegisterContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacyPolicy, setOpenPrivacyPolicy] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    try {
      await apiRegister(data)
      toast.success(
        "Chúng tôi đã gửi email xác nhận đến địa chỉ của bạn. Vui lòng kiểm tra hộp thư đến để hoàn tất đăng ký.",
        {
          duration: 5000,
        },
      )
    } catch (error: any) {
      if (error.code === ErrorCode.RESOURCE_ALREADY_EXISTS) {
        if (error.message.includes("username already exists")) {
          toast.error("Username đã tồn tại. Vui lòng chọn username khác.")
        }
        if (error.message.includes("email already exists")) {
          toast.error("Email đã được sử dụng. Vui lòng sử dụng email khác.")
        }
      }
      else {
        toast.error("Đã xảy ra lỗi khi tạo tài khoản. Vui lòng thử lại sau.", {
          duration: 3000,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading && <FullPageLoader />}
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Toeicify</span>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900">Tạo tài khoản</h2>
            <p className="mt-2 text-gray-600">Bắt đầu hành trình luyện thi TOEIC của bạn hôm nay</p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Đăng ký</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName" className="mb-2">Tên</Label>
                    <div className="space-y-2">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="fullName"
                          type="text"
                          required
                          className="pl-10"
                          placeholder="Nhập họ và tên"
                          {...register("fullName")}
                        />
                      </div>
                      <div className="min-h-[20px]">
                        {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="username" className="mb-2">Username</Label>
                    <div className="space-y-2">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="username"
                          type="text"
                          required
                          className="pl-10"
                          placeholder="Nhập username"
                          {...register("username")}
                        />
                      </div>
                      <div className="min-h-[20px]">
                        {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="mb-2">Địa chỉ Email</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="pl-10"
                        placeholder="Nhập email của bạn"
                        {...register("email")}
                      />
                    </div>
                    <div className="min-h-[20px]">
                      {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="mb-2">Mật khẩu</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        className="pl-10 pr-10"
                        placeholder="Tạo mật khẩu"
                        {...register("password")}
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
                    <div className="min-h-[20px]">
                      {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="mb-2">Xác nhận mật khẩu</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        className="pl-10 pr-10"
                        placeholder="Nhập lại mật khẩu"
                        {...register("confirmPassword")}
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
                    <div className="min-h-[20px]">
                      {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          agreeToTerms: checked as boolean,
                        }))
                      }
                      required
                    />
                    <Label htmlFor="agreeToTerms" className="text-sm">
                      Tôi đồng ý với{" "}
                      <button
                        type="button"
                        className="text-blue-600 hover:underline"
                        onClick={() => setOpenTerms(true)}
                      >
                        Điều khoản dịch vụ
                      </button>{" "}
                      và{" "}
                      <button
                        type="button"
                        className="text-blue-600 hover:underline"
                        onClick={() => setOpenPrivacyPolicy(true)}
                      >
                        Chính sách bảo mật
                      </button>
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 text-white hover:bg-blue-500"
                  disabled={!formData.agreeToTerms || loading}
                >
                  {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Đăng nhập tại đây
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <TermsModal open={openTerms} onOpenChange={setOpenTerms} />
      <PrivacyPolicy open={openPrivacyPolicy} onOpenChange={setOpenPrivacyPolicy} />
    </>
  )
}

export function RegisterWrapper() {
  return <RegisterContent />
}
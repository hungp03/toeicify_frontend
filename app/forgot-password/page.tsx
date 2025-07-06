"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  BookOpen,
  Mail,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";

type Step = "email" | "otp" | "reset";

const ForgotPassword = () => {
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Gửi mã xác thực tới:", email);
    setCurrentStep("otp");
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      console.log("Xác minh mã OTP:", otp);
      setCurrentStep("reset");
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword === formData.confirmPassword) {
      console.log("Đặt lại mật khẩu cho:", email);
      // Thực hiện gọi API đặt lại mật khẩu tại đây
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const renderEmailStep = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Quên mật khẩu?</CardTitle>
        <CardDescription className="text-center">
          Nhập email của bạn để nhận mã xác thực
        </CardDescription>
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
  );

  const renderOtpStep = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Xác minh mã</CardTitle>
        <CardDescription className="text-center">
          Chúng tôi đã gửi mã gồm 6 chữ số tới {email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-500" disabled={otp.length !== 6}>
            Xác nhận mã
          </Button>
        </form>
        <div className="mt-6 text-center space-y-2">
          <button
            type="button"
            onClick={() => console.log("Gửi lại mã OTP:", email)}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Chưa nhận được mã? Gửi lại
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
  );

  const renderResetStep = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Đặt lại mật khẩu</CardTitle>
        <CardDescription className="text-center">
          Nhập mật khẩu mới bên dưới
        </CardDescription>
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

          {formData.newPassword &&
            formData.confirmPassword &&
            formData.newPassword !== formData.confirmPassword && (
              <p className="text-sm text-red-600">Mật khẩu không khớp</p>
            )}

          <Button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-500"
            disabled={
              !formData.newPassword ||
              !formData.confirmPassword ||
              formData.newPassword !== formData.confirmPassword
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
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl space-y-8">

        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">TOEIC Master</span>
          </Link>
        </div>

        {currentStep === "email" && renderEmailStep()}
        {currentStep === "otp" && renderOtpStep()}
        {currentStep === "reset" && renderResetStep()}
      </div>
    </div>
  );
};

export default ForgotPassword;

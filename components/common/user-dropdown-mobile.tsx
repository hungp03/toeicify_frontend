"use client";

import { User, LayoutDashboard, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const UserDropdownMobile = () => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const router = useRouter();
    if (!user) return null;

    return (
        <div className="flex flex-col gap-2 pt-4 border-t">
            <p className="text-sm text-gray-600">Xin chào, <strong>{user.fullName}</strong></p>

            {user?.roleId === "ADMIN" && (
                <Button
                    variant="ghost"
                    className="justify-start w-full"
                    onClick={() => router.push("/admin")}
                >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Trang quản trị
                </Button>
            )}

            <Button
                variant="ghost"
                className="justify-start w-full"
                onClick={() => router.push("/account")}
            >
                <User className="w-4 h-4 mr-2" />
                Tài khoản
            </Button>

            <Button
                variant="ghost"
                className="justify-start w-full text-red-600"
                onClick={async () => {
                    logout();
                    toast.success("Bạn đã đăng xuất");
                    router.push("/");
                }}
            >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
            </Button>
        </div>
    );
};

export default UserDropdownMobile;

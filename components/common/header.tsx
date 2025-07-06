"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, User, BookOpen } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navItems = [
    { name: "Trang chủ", path: "/" },
    { name: "Luyện tập", path: "/practice-tests" },
    { name: "Blog", path: "/blog" },
    {name: "Flashcards", path: "/flashcards"},
    { name: "Tiến độ", path: "/progress" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">TOEIC Master</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive(item.path) ? "text-blue-600" : "text-gray-700"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Tìm bài luyện tập..."
                className="pl-10 w-64"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-blue-600 text-white">Đăng ký</Button>
            </Link>
            <Link href="/account">
              <Button variant="ghost" size="sm" title="Tài khoản">
                <User className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8 p-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`text-lg font-medium transition-colors hover:text-blue-600 ${
                      isActive(item.path) ? "text-blue-600" : "text-gray-700"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t">
                  <div className="space-y-3">
                    <Link href="/login" className="block">
                      <Button variant="outline" className="w-full">
                        Đăng nhập
                      </Button>
                    </Link>
                    <Link href="/register" className="block">
                      <Button className="w-full">Đăng ký</Button>
                    </Link>
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="lg:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Tìm bài luyện tập..."
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

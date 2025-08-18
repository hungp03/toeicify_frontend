"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import _ from "lodash";
import { Button } from "@/components/ui/button";
import AuthSection from "@/components/common/auth-section";
import Notification from "@/components/common/notification";
import AuthSectionMobile from "./auth-section-mobile";
import SearchComponent from "./search";
import { Menu, BookOpen } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { navItems } from "@/lib/constants";
import { getAllExams } from "@/lib/api/exam";
import { PracticeTests } from "@/types/exam";
import { toast } from "sonner";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<PracticeTests[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isActive = (path: string) => pathname === path;

  // Debounced search function with optimized timing
  const debouncedSearch = useMemo(
    () => _.debounce(async (keyword: string) => {
      if (!keyword.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
        setIsSearching(false);
        return;
      }

      try {
        setIsSearching(true);
        const response = await getAllExams({
          page: 0,
          size: 3, // Only get 3 results for preview
          keyword: keyword.trim()
        });

        setSearchResults(response.data?.result || []);
        setShowDropdown(true);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Lỗi khi tìm kiếm đề thi');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 1000),
    []
  );

  // Optimized search input change handler
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    if (value.trim()) {
      setIsSearching(true);
      debouncedSearch(value);
    } else {
      // Batch state updates to minimize re-renders
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      debouncedSearch.cancel();
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle "View More" click
  const handleViewMore = () => {
    const keyword = searchTerm.trim();
    if (!keyword) return;

    router.push(`/practice-tests?keyword=${encodeURIComponent(keyword)}&page=1`);
    setShowDropdown(false);
    setSearchTerm("");
  };

  // Handle exam item click
  const handleExamClick = (examId: number) => {
    setShowDropdown(false);
    setSearchTerm("");
    router.push(`/practice-tests/${examId}`);
  };

  // Handle search submit (Enter key)
  const handleSearchSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      handleViewMore();
    }
  };

  // Search component props to avoid recreation
  const searchProps = {
    searchTerm,
    handleSearchChange,
    handleSearchSubmit,
    searchRef,
    inputRef,
    isSearching,
    showDropdown,
    searchResults,
    handleExamClick,
    handleViewMore,
    setShowDropdown
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Toeicify</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${isActive(item.path) ? "text-blue-600" : "text-gray-700"
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop search */}
          <div className="hidden lg:flex items-center space-x-4">
            <SearchComponent {...searchProps} />
          </div>

          <div className="hidden md:flex items-center space-x-3">
            
            <AuthSection />
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
                    className={`text-lg font-medium transition-colors hover:text-blue-600 ${isActive(item.path) ? "text-blue-600" : "text-gray-700"
                      }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t">
                  <AuthSectionMobile />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="lg:hidden pb-4">
          <SearchComponent {...searchProps} isMobile />
        </div>
      </div>
    </header>
  );
};

export default Header;
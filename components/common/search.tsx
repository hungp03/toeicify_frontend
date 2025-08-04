import React from "react";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PracticeTests } from "@/types/exam";

interface SearchComponentProps {
    searchTerm: string;
    handleSearchChange: (value: string) => void;
    handleSearchSubmit: (e: React.KeyboardEvent) => void;
    searchRef: React.RefObject<HTMLDivElement | null>;
    inputRef: React.RefObject<HTMLInputElement | null>;
    isSearching: boolean;
    showDropdown: boolean;
    searchResults: PracticeTests[];
    handleExamClick: (examId: number) => void;
    handleViewMore: () => void;
    setShowDropdown: (show: boolean) => void;
    isMobile?: boolean;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
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
    setShowDropdown,
    isMobile = false
}) => (
    <div className={`relative ${isMobile ? 'w-full' : 'w-96'}`} ref={searchRef}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
        <Input
            key="search-input"
            ref={inputRef}
            type="text"
            placeholder="Tìm bài luyện tập..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleSearchSubmit}
            className={`pl-10 pr-10 ${isMobile ? 'w-full' : ''}`}
            onFocus={() => {
                if (searchResults.length > 0 && searchTerm.trim()) {
                    setShowDropdown(true);
                }
            }}
            autoComplete="off"
        />

        {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-blue-600" />
        )}


        {showDropdown && searchTerm.trim() && (searchResults.length > 0 || (!isSearching)) && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-50 max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                    <>
                        <div className="py-2">
                            {searchResults.map((exam) => (
                                <div
                                    key={exam.examId}
                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    onMouseDown={(e) => {
                                        e.preventDefault(); // Prevent input blur
                                        handleExamClick(exam.examId);
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600">
                                                    {exam.categoryName}
                                                </Badge>
                                            </div>
                                            <h4 className="font-medium text-gray-900 truncate">
                                                {exam.examName}
                                            </h4>
                                            <p className="text-sm text-gray-500 truncate">
                                                {exam.examDescription}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                <span>{exam.totalQuestions} câu hỏi</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                            <button
                                type="button"
                                className="w-full flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md py-2 px-4 transition-colors duration-200 text-sm font-medium"
                                onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent input blur
                                    handleViewMore();
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                <span>Xem thêm kết quả cho "{searchTerm}"</span>
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </button>
                        </div>
                    </>
                ) : (
                    !isSearching && (
                        <div className="px-4 py-6 text-center text-gray-500">
                            <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">Không tìm thấy đề thi nào</p>
                            <p className="text-xs mt-1">Thử tìm kiếm với từ khóa khác</p>
                        </div>
                    )
                )}
            </div>
        )}
    </div>
);

export default SearchComponent;
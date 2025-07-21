import Link from "next/link"
import { Home, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import '@/app/globals.css'
const NotFound = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full text-center">
                <div className="mb-8">
                    <h1 className="text-8xl font-bold text-indigo-600 mb-4">404</h1>
                    <div className="w-24 h-1 bg-indigo-600 mx-auto rounded-full"></div>
                </div>

                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Trang không tồn tại</h2>
                    <p className="text-lg text-gray-600 mb-6">
                        Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm. Có thể trang đã được di chuyển hoặc không còn
                        tồn tại.
                    </p>
                </div>

                <div className="mb-8">
                    <div className="w-32 h-32 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                        <Search className="w-16 h-16 text-indigo-600" />
                    </div>
                </div>


                <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                    <Button asChild className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500">
                        <Link href="/" className="inline-flex items-center">
                            <Home className="w-4 h-4 mr-2" />
                            Về trang chủ
                        </Link>
                    </Button>
                </div>

                <div className="mt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-4">Bạn có thể thử:</p>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Kiểm tra lại đường dẫn URL</li>
                        <li>• Sử dụng menu điều hướng</li>
                        <li>• Tìm kiếm nội dung bạn cần</li>
                    </ul>
                </div>

            </div>
        </div>
    )
}

export default NotFound;

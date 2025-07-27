const TermsContent = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Điều Khoản Dịch Vụ</h1>
                <p className="text-gray-600">Cập nhật lần cuối: Tháng 08, 2025</p>
            </div>

            <div className="prose prose-gray max-w-none">
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Chấp Nhận Điều Khoản</h2>
                    <p className="text-gray-700 mb-4">
                        Bằng việc truy cập và sử dụng website Toeicify, bạn đồng ý tuân theo và bị ràng buộc bởi
                        các điều khoản và điều kiện sử dụng này. Nếu bạn không đồng ý với bất kỳ phần nào của các
                        điều khoản này, bạn không được phép sử dụng dịch vụ của chúng tôi.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Mô Tả Dịch Vụ</h2>
                    <p className="text-gray-700 mb-4">
                        Toeicify cung cấp các dịch vụ học tập và luyện thi TOEIC trực tuyến, bao gồm:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                        <li>Các bộ đề thi thử TOEIC</li>
                        <li>Hệ thống flashcard để học từ vựng</li>
                        <li>Theo dõi tiến độ học tập cá nhân</li>
                        {/* <li>Blog và tài liệu học tập</li> */}
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Đăng Ký Tài Khoản</h2>
                    <p className="text-gray-700 mb-4">
                        Để sử dụng đầy đủ các tính năng của Toeicify, bạn cần tạo tài khoản. Bạn cam kết:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                        <li>Cung cấp thông tin chính xác, đầy đủ và cập nhật</li>
                        <li>Bảo mật thông tin đăng nhập của mình</li>
                        <li>Chịu trách nhiệm cho mọi hoạt động diễn ra dưới tài khoản của bạn</li>
                        <li>Thông báo ngay cho chúng tôi nếu phát hiện việc sử dụng trái phép tài khoản</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Quyền và Nghĩa Vụ Của Người Dùng</h2>
                    <div className="mb-6">
                        <h3 className="text-xl font-medium text-gray-900 mb-3">Quyền của người dùng:</h3>
                        <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                            <li>Truy cập và sử dụng các dịch vụ theo gói đã đăng ký</li>
                            <li>Được hỗ trợ kỹ thuật và tư vấn học tập</li>
                            <li>Được bảo mật thông tin cá nhân theo chính sách riêng tư</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-medium text-gray-900 mb-3">Nghĩa vụ của người dùng:</h3>
                        <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                            <li>Không được sao chép, phân phối, hoặc sử dụng nội dung cho mục đích thương mại</li>
                            <li>Không được can thiệp vào hoạt động bình thường của hệ thống</li>
                            <li>Tuân thủ các quy tắc và hướng dẫn sử dụng</li>
                            {/* <li>Thanh toán đầy đủ và đúng hạn các khoản phí (nếu có)</li> */}
                        </ul>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Sở Hữu Trí Tuệ</h2>
                    <p className="text-gray-700 mb-4">
                        Tất cả nội dung trên Toeicify, bao gồm văn bản, hình ảnh, âm thanh, và phần mềm,
                        đều sử dụng cho mục đích phát triển, không sử dụng cho mục đích thương mại.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Giới Hạn Trách Nhiệm</h2>
                    <p className="text-gray-700 mb-4">
                        Toeicify không chịu trách nhiệm cho bất kỳ thiệt hại trực tiếp, gián tiếp, ngẫu nhiên,
                        hoặc hậu quả nào phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ của chúng tôi.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Chấm Dứt Dịch Vụ</h2>
                    <p className="text-gray-700 mb-4">
                        Chúng tôi có quyền tạm ngừng hoặc chấm dứt tài khoản của bạn nếu phát hiện vi phạm các
                        điều khoản sử dụng. Bạn cũng có thể hủy tài khoản bất kỳ lúc nào bằng cách liên hệ với
                        bộ phận hỗ trợ.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Thay Đổi Điều Khoản</h2>
                    <p className="text-gray-700 mb-4">
                        Chúng tôi có quyền cập nhật và thay đổi các điều khoản này bất kỳ lúc nào. Các thay đổi
                        sẽ có hiệu lực ngay khi được đăng tải trên website. Việc tiếp tục sử dụng dịch vụ sau
                        khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
                    </p>
                </section>
            </div>
        </div>
    )
}

export default TermsContent
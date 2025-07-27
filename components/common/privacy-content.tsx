const PrivacyContent = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Chính Sách Bảo Mật</h1>
                <p className="text-gray-600">Cập nhật lần cuối: Tháng 8, 2025</p>
            </div>

            <div className="prose prose-gray max-w-none">
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Cam Kết Bảo Mật</h2>
                    <p className="text-gray-700 mb-4">
                        Toeicify cam kết bảo vệ quyền riêng tư và thông tin cá nhân của người dùng. Chính sách
                        này mô tả cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin của bạn khi sử dụng
                        dịch vụ của chúng tôi.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Thông Tin Chúng Tôi Thu Thập</h2>

                    <div className="mb-6">
                        <h3 className="text-xl font-medium text-gray-900 mb-3">Thông tin cá nhân:</h3>
                        <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                            <li>Họ tên, email, số điện thoại</li>
                            <li>Ngày sinh, giới tính (tùy chọn)</li>
                            <li>Thông tin thanh toán (xử lý qua các cổng thanh toán bảo mật)</li>
                            <li>Ảnh đại diện (nếu bạn tải lên)</li>
                        </ul>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-medium text-gray-900 mb-3">Thông tin học tập:</h3>
                        <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                            <li>Kết quả các bài thi, bài luyện tập</li>
                            <li>Tiến độ học tập và thống kê cá nhân</li>
                            <li>Thời gian học tập và tần suất sử dụng</li>
                            <li>Các thiết lập và tùy chọn cá nhân</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-medium text-gray-900 mb-3">Thông tin kỹ thuật:</h3>
                        <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                            <li>Địa chỉ IP, loại trình duyệt, hệ điều hành</li>
                            <li>Cookies và dữ liệu phiên làm việc</li>
                            <li>Nhật ký truy cập và sử dụng dịch vụ</li>
                            <li>Dữ liệu phân tích website</li>
                        </ul>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Mục Đích Sử Dụng Thông Tin</h2>
                    <p className="text-gray-700 mb-4">Chúng tôi sử dụng thông tin của bạn để:</p>
                    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                        <li>Cung cấp và cải thiện dịch vụ học tập</li>
                        <li>Cá nhân hóa trải nghiệm người dùng</li>
                        <li>Theo dõi tiến độ và đưa ra gợi ý học tập phù hợp</li>
                        <li>Xử lý thanh toán và quản lý tài khoản</li>
                        <li>Gửi thông báo quan trọng về dịch vụ</li>
                        <li>Hỗ trợ khách hàng và giải đáp thắc mắc</li>
                        <li>Phân tích và cải thiện hiệu suất website</li>
                        <li>Tuân thủ các yêu cầu pháp lý</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Chia Sẻ Thông Tin</h2>
                    <p className="text-gray-700 mb-4">
                        Chúng tôi không bán, trao đổi, hoặc chuyển giao thông tin cá nhân của bạn cho bên thứ ba,
                        trừ các trường hợp sau:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                        <li>Với sự đồng ý rõ ràng của bạn</li>
                        <li>Với các đối tác dịch vụ đáng tin cậy để hỗ trợ vận hành (thanh toán, hosting, analytics)</li>
                        <li>Khi được yêu cầu bởi pháp luật hoặc cơ quan có thẩm quyền</li>
                        <li>Để bảo vệ quyền lợi, tài sản, hoặc an toàn của TOEIC Master và người dùng</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Bảo Mật Thông Tin</h2>
                    <p className="text-gray-700 mb-4">
                        Chúng tôi áp dụng các biện pháp bảo mật tiên tiến để bảo vệ thông tin của bạn:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                        <li>Mã hóa SSL/TLS cho tất cả dữ liệu truyền tải</li>
                        <li>Mã hóa mật khẩu và thông tin nhạy cảm</li>
                        <li>Hệ thống firewall và giám sát bảo mật 24/7</li>
                        <li>Kiểm soát truy cập nghiêm ngặt cho nhân viên</li>
                        <li>Sao lưu dữ liệu định kỳ và kế hoạch khôi phục</li>
                        <li>Cập nhật bảo mật thường xuyên</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies và Công Nghệ Theo Dõi</h2>
                    <p className="text-gray-700 mb-4">
                        Chúng tôi sử dụng cookies và các công nghệ tương tự để:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                        <li>Ghi nhớ thông tin đăng nhập và thiết lập cá nhân</li>
                        <li>Phân tích lưu lượng truy cập và cải thiện trải nghiệm</li>
                        <li>Cung cấp nội dung và quảng cáo phù hợp</li>
                        <li>Đảm bảo bảo mật và ngăn chặn gian lận</li>
                    </ul>
                    <p className="text-gray-700 mb-4">
                        Bạn có thể quản lý cookies thông qua cài đặt trình duyệt, nhưng việc tắt cookies có thể
                        ảnh hưởng đến một số tính năng của website.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Quyền Của Người Dùng</h2>
                    <p className="text-gray-700 mb-4">Bạn có quyền:</p>
                    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                        <li>Truy cập và xem thông tin cá nhân đã cung cấp</li>
                        <li>Cập nhật, chỉnh sửa thông tin không chính xác</li>
                        <li>Yêu cầu xóa tài khoản và dữ liệu cá nhân</li>
                        <li>Hạn chế hoặc phản đối việc xử lý dữ liệu</li>
                        <li>Rút lại sự đồng ý đã cung cấp trước đó</li>
                        <li>Nhận bản sao dữ liệu cá nhân theo định dạng có cấu trúc</li>
                    </ul>
                    <p className="text-gray-700 mb-4">
                        Để thực hiện các quyền này, vui lòng liên hệ với chúng tôi qua email hoặc hệ thống hỗ trợ.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Lưu Trữ Dữ Liệu</h2>
                    <p className="text-gray-700 mb-4">
                        Thông tin của bạn được lưu trữ trên các máy chủ bảo mật tại Việt Nam và có thể được
                        sao lưu tại các trung tâm dữ liệu quốc tế tuân thủ các tiêu chuẩn bảo mật cao. Chúng tôi
                        chỉ lưu trữ thông tin trong thời gian cần thiết để cung cấp dịch vụ hoặc theo yêu cầu pháp lý.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Thay Đổi Chính Sách</h2>
                    <p className="text-gray-700 mb-4">
                        Chúng tôi có thể cập nhật chính sách bảo mật này để phản ánh các thay đổi trong dịch vụ
                        hoặc yêu cầu pháp lý. Các thay đổi quan trọng sẽ được thông báo qua email hoặc thông báo
                        trên website trước khi có hiệu lực.
                    </p>
                </section>
            </div>
        </div>
    )
}

export default PrivacyContent
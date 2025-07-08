"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Play,
  ChevronRight,
} from "lucide-react";

const HomePage = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Bài thi mô phỏng toàn diện",
      description: "Đầy đủ các kỹ năng TOEIC: Nghe, Đọc, Nói và Viết với bài thi mô phỏng sát thực tế.",
    },
    {
      icon: Users,
      title: "Nội dung biên soạn bởi chuyên gia",
      description: "Câu hỏi được xây dựng bởi đội ngũ chuyên gia TOEIC, bám sát định dạng thật.",
    },
    {
      icon: Award,
      title: "Phân tích kết quả chi tiết",
      description: "Theo dõi tiến trình học và xác định điểm yếu để cải thiện hiệu quả.",
    },
    {
      icon: TrendingUp,
      title: "Lộ trình học cá nhân hóa",
      description: "Đề xuất học tập phù hợp với trình độ và mục tiêu của bạn.",
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-blue-400 via-blue-600 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Làm chủ kỳ thi TOEIC với Toeicify
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Luyện tập với đề thi sát thực tế, theo dõi tiến trình và đạt mục tiêu điểm số
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                >
                  Bắt đầu luyện miễn phí
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/practice-tests">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-blue-600 hover:bg-white px-8 py-3 text-lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Xem bài luyện tập
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Vì sao chọn Toeicify?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tất cả những gì bạn cần để chinh phục kỳ thi TOEIC, với nội dung và phương pháp đã được chứng minh.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Đề luyện tập cho mọi trình độ
            </h2>
            <p className="text-xl text-gray-600">
              Từ người mới bắt đầu đến nâng cao – bạn đều có bài luyện phù hợp.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                level: "Mới bắt đầu",
                color: "bg-green-500",
                score: "400–600",
                tests: "25 đề",
                description: "Phù hợp cho người mới làm quen với TOEIC.",
              },
              {
                level: "Trung cấp",
                color: "bg-yellow-500",
                score: "600–800",
                tests: "30 đề",
                description: "Củng cố kiến thức và tăng sự tự tin.",
              },
              {
                level: "Nâng cao",
                color: "bg-red-500",
                score: "800–990",
                tests: "20 đề",
                description: "Thử sức với các câu hỏi khó nhất.",
              },
            ].map((level, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <Badge className={`${level.color} text-white w-fit mx-auto mb-4`}>
                    {level.level}
                  </Badge>
                  <CardTitle className="text-2xl">{level.score}</CardTitle>
                  <CardDescription>{level.tests} có sẵn</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">{level.description}</p>
                  <Link href="/practice-tests">
                    <Button className="w-full">Luyện ngay</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sẵn sàng tăng điểm TOEIC của bạn?
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Hàng chục ngàn học viên đã thành công – bạn sẽ là người tiếp theo?
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg"
            >
              Bắt đầu miễn phí
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

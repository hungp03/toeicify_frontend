"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCategoryStore } from "@/store/categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import {
  BookOpen,
  Users,
  Award,
  Play,
  ChevronRight,
  Monitor,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

const HomePage = () => {
  const router = useRouter();
  const { categories, fetchCategories } = useCategoryStore()
  const user = useAuthStore((state) => state.user);

  const handleClick = () => {
    if (user) {
      router.push('/practice-tests')
    } else {
      router.push('/login')
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const getColor = (index: number): string => {
    const colors = ['bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-blue-500', 'bg-purple-500']
    return colors[index % colors.length]
  }

  const features = [
    {
      icon: BookOpen,
      title: "Bài thi mô phỏng toàn diện",
      description: "Đầy đủ các kỹ năng cho kỳ thi TOEIC Listening - Reading với bài thi mô phỏng gần với thực tế.",
    },
    {
      icon: Users,
      title: "Nội dung biên soạn chi tiết",
      description: "Câu hỏi được xây dựng bởi đội ngũ chuyên gia TOEIC, bám sát định dạng thật.",
    },
    {
      icon: Award,
      title: "Phân tích kết quả học tập",
      description: "Theo dõi tiến trình học và xác định điểm yếu để cải thiện hiệu quả.",
    },
    {
      icon: Monitor,
      title: "Giao diện thân thiện, dễ sử dụng",
      description: "Thiết kế hiện đại, dễ dàng truy cập và sử dụng trên nhiều thiết bị.",
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative text-white py-20">
      <Image
        src="/bg-hero.jpg" 
        alt="TOEIC background"
        fill
        priority
        className="object-cover object-center opacity-60"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Làm chủ kỳ thi TOEIC với Toeicify
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Luyện tập với đề thi sát thực tế, theo dõi tiến trình và đạt mục tiêu điểm số
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleClick}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            >
              Bắt đầu luyện miễn phí
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
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
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Danh mục bài thi
            </h2>
            <p className="text-xl text-gray-600">
              Các danh mục bài thi đa dạng, phù hợp với mọi trình độ và nhu cầu luyện tập
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((cat, index) => (
              <Card key={cat.categoryId} className="text-center">
                <CardHeader>
                  {/* <Badge
                    className={`${getColor(index)} text-white w-fit mx-auto mb-4`}
                  >
                    {cat.examCount} Bài thi
                  </Badge> */}
                  <CardTitle className="text-2xl">{cat.categoryName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">{cat.description}</p>
                  <Link href={`/practice-tests?categoryId=${cat.categoryId}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-500">Luyện ngay</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
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
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sẵn sàng tăng điểm TOEIC của bạn?
          </h2>
          <Button onClick={handleClick}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg"
          >
            Bắt đầu miễn phí
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

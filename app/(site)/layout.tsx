import type { Metadata } from "next";
import Header from "@/components/common/header";
import Footer from "@/components/common/footer";


export const metadata: Metadata = {
  title: "Toeicify",
  description: "Làm chủ kỳ thi TOEIC với Toeicify",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
     <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

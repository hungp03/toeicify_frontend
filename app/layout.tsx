import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient } from "@tanstack/react-query";
import Providers from "@/providers/page";
import Header from "@/components/common/header";
import Footer from "@/components/common/footer";
import "./globals.css";

const queryClient = new QueryClient();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Providers>
          <TooltipProvider>
            <Toaster />
            <Header />
            {children}
            <Footer />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}

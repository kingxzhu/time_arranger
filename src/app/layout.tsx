import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "私董会时间协调",
  description: "私董会成员时间协调工具 - 找到大家都合适的时间",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}

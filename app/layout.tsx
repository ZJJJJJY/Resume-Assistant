import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "大学生求职材料整理助手",
  description: "帮助大学生把项目经历整理成更适合简历和面试表达的材料。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

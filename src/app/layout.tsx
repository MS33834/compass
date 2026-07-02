import type { Metadata, Viewport } from "next";
import { serif, sans, mono } from "@/lib/fonts";
import "./globals.css";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: "Compass · 个人方向导航",
  description: "锚定目标，规划航程，校准方向",
};

export const viewport: Viewport = {
  themeColor: "#0B1426",
  width: "device-width",
  initialScale: 1,
};

// 根布局：注入字体 CSS 变量与全局 Provider
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

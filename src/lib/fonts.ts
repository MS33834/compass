import { Cormorant_Garamond, Source_Sans_3, JetBrains_Mono } from "next/font/google";

// 衬线字体：用于标题与罗盘刻度等仪式感场景
export const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-serif",
});

// 无衬线字体：正文与界面默认字体
export const sans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

// 等宽字体：用于坐标、数据、代码等需要等宽对齐的内容
export const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-mono",
});

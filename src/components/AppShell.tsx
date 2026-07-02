"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Compass,
  Map,
  BookOpen,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

// 导航项配置：路径、文案、图标
const navItems = [
  { href: "/dashboard", label: "仪表盘", icon: LayoutDashboard },
  { href: "/compass", label: "罗盘", icon: Compass },
  { href: "/voyage", label: "航程", icon: Map },
  { href: "/logbook", label: "日志", icon: BookOpen },
  { href: "/profile", label: "个人中心", icon: User },
] as const;

// 判断当前路径是否命中某个导航项（含子路径）
function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// 已登录页面的布局壳：
// - 桌面端左侧固定 240px 导航栏
// - 顶部展示用户信息（来自 useSession）
// - 移动端隐藏侧边栏，改为底部标签栏
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name ?? "航海者";
  const avatarChar = (session?.user?.name ?? "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-abyss">
      {/* 桌面端左侧固定导航栏（240px） */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col border-r border-brass/15 bg-abyss-600/80 backdrop-blur-md md:flex">
        {/* 品牌标识 */}
        <div className="flex h-16 items-center gap-2 border-b border-brass/10 px-6">
          <Compass className="h-6 w-6 text-brass" />
          <span className="font-serif text-xl font-semibold text-ivory">
            Compass
          </span>
        </div>
        {/* 导航菜单 */}
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brass/10 text-brass"
                    : "text-starlight hover:bg-white/5 hover:text-ivory"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 主内容区：左侧留出 240px 给侧边栏 */}
      <div className="md:pl-60">
        {/* 顶部用户信息栏 */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-3 border-b border-brass/10 bg-abyss/80 px-4 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-brass/40 bg-abyss-300 text-sm font-semibold text-brass">
              {avatarChar}
            </div>
            <span className="hidden text-sm text-ivory sm:inline">{userName}</span>
          </div>
        </header>

        {/* 页面内容：最大宽度 7xl 居中，移动端为底部标签栏预留空间 */}
        <main className="mx-auto max-w-7xl px-4 py-8 pb-24 md:px-8 md:pb-8">
          {children}
        </main>
      </div>

      {/* 移动端底部标签栏 */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-brass/15 bg-abyss-600/95 backdrop-blur-md md:hidden">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors",
                active ? "text-brass" : "text-starlight"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

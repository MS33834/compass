import Link from 'next/link';
import { Anchor, Navigation, Telescope } from 'lucide-react';
import { CompassRose } from '@/components/CompassRose';
import { Card } from '@/components/ui/Card';

// 落地页 —— 深海航海仪器 × 现代极简主义，全屏沉浸式
export default function HomePage() {
  // 标题逐字淡入：按词分组保留换行能力，组内逐字 stagger
  const TITLE = 'Find Your True North';
  const titleWords = TITLE.split(' ');
  let charIndex = 0;
  const titleRender = titleWords.map((word, wi) => (
    <span key={wi} className="inline-block whitespace-nowrap">
      {Array.from(word).map((ch) => {
        const delay = 0.1 + charIndex * 0.04;
        charIndex += 1;
        return (
          <span
            key={`${wi}-${charIndex}`}
            className="inline-block opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${delay}s` }}
          >
            {ch}
          </span>
        );
      })}
      {wi < titleWords.length - 1 ? ' ' : null}
    </span>
  ));

  // 功能亮点
  const features = [
    {
      icon: Anchor,
      title: '锚定',
      desc: '在四象限罗盘上锚定你的核心目标',
    },
    {
      icon: Navigation,
      title: '航行',
      desc: '拆解里程碑，追踪每一次前进',
    },
    {
      icon: Telescope,
      title: '校准',
      desc: '记录航程日志，持续校准方向',
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-abyss text-ivory">
      {/* ============ Hero 区域 ============ */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/* 背景：旋转罗盘玫瑰 + brass 辉光 */}
        <CompassRose className="animate-spin-slow pointer-events-none absolute left-1/2 top-1/2 h-[125vmin] w-[125vmin] -translate-x-1/2 -translate-y-1/2 text-starlight opacity-[0.08]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.12),transparent_70%)]" />

        <div className="relative z-10 flex flex-col items-center">
          <h1 className="font-serif text-5xl leading-tight tracking-tight text-ivory sm:text-6xl md:text-7xl lg:text-8xl">
            {titleRender}
          </h1>

          <p
            className="mt-6 font-sans text-base tracking-[0.2em] text-starlight opacity-0 animate-fade-in-up sm:text-lg"
            style={{ animationDelay: '1.1s' }}
          >
            锚定目标 · 规划航程 · 校准方向
          </p>

          <div
            className="mt-12 flex flex-col items-center gap-4 opacity-0 animate-fade-in-up sm:flex-row sm:gap-6"
            style={{ animationDelay: '1.35s' }}
          >
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg border border-brass bg-brass/10 px-8 py-3 text-lg font-medium text-brass transition-all hover:bg-brass/20 hover:shadow-[0_0_20px_rgba(201,162,39,0.3)]"
            >
              开始航行
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-starlight/30 px-8 py-3 text-lg font-medium text-ivory transition-all hover:border-brass/50 hover:bg-brass/10"
            >
              登录
            </Link>
          </div>
        </div>
      </section>

      {/* ============ 功能亮点区域 ============ */}
      <section className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="mb-16 text-center">
          <h2 className="font-serif text-4xl text-ivory sm:text-5xl">航海的三件仪器</h2>
          <p className="mt-4 font-sans text-starlight">从锚定到校准，一路相伴</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <Card
              key={title}
              className="group flex flex-col items-start gap-5 rounded-2xl border border-starlight/10 bg-abyss-50/30 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-brass/40 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-brass/30 bg-brass/10 text-brass transition-colors group-hover:bg-brass/20">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-2xl text-ivory">{title}</h3>
              <p className="font-sans text-sm leading-relaxed text-starlight">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ============ 底部 CTA ============ */}
      <section className="relative mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
        <div className="relative overflow-hidden rounded-3xl border border-brass/20 bg-gradient-to-b from-brass/10 to-transparent px-8 py-16 sm:px-16">
          <CompassRose className="animate-spin-slow pointer-events-none absolute -right-24 -top-24 h-64 w-64 text-brass opacity-10" />
          <h2 className="relative font-serif text-4xl text-ivory sm:text-5xl">启航，从今天</h2>
          <p className="relative mt-4 font-sans text-starlight">
            建立你的第一张航海图，找到属于自己的真北。
          </p>
          <Link
            href="/register"
            className="relative mt-10 inline-flex items-center justify-center rounded-lg border border-brass bg-brass/10 px-8 py-3 text-lg font-medium text-brass transition-all hover:bg-brass/20 hover:shadow-[0_0_20px_rgba(201,162,39,0.3)]"
          >
            开始航行
          </Link>
        </div>
      </section>

      {/* ============ 页脚 ============ */}
      <footer className="border-t border-starlight/10 px-6 py-8 text-center">
        <p className="font-sans text-sm text-starlight">© 2026 Compass</p>
      </footer>
    </main>
  );
}

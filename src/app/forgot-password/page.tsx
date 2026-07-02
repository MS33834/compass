'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { CompassRose } from '@/components/CompassRose';

// 忘记密码页 —— 重置密码
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setError('请求失败，请重试');
        setLoading(false);
        return;
      }
      setSent(true);
      setLoading(false);
    } catch {
      setError('网络异常，请重试');
      setLoading(false);
    }
  }

  // 发送成功提示
  if (sent) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-abyss px-6 py-12">
        <CompassRose className="animate-spin-slow pointer-events-none absolute left-1/2 top-1/2 h-[125vmin] w-[125vmin] -translate-x-1/2 -translate-y-1/2 text-starlight opacity-[0.05]" />

        <div className="relative z-10 w-full max-w-md rounded-2xl border border-starlight/15 bg-abyss-50/40 p-8 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-10">
          <h1 className="font-serif text-3xl text-ivory sm:text-4xl">重置邮件已发送</h1>
          <p className="mt-4 font-sans text-sm leading-relaxed text-starlight">
            如果该邮箱已注册，你将收到重置邮件。
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center justify-center rounded-lg border border-brass bg-brass/10 px-8 py-3 text-lg font-medium text-brass transition-all hover:bg-brass/20 hover:shadow-[0_0_20px_rgba(201,162,39,0.3)]"
          >
            返回登录
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-abyss px-6 py-12">
      {/* 背景罗盘装饰 */}
      <CompassRose className="animate-spin-slow pointer-events-none absolute left-1/2 top-1/2 h-[125vmin] w-[125vmin] -translate-x-1/2 -translate-y-1/2 text-starlight opacity-[0.05]" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-starlight/15 bg-abyss-50/40 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl text-ivory sm:text-4xl">重置密码</h1>
          <p className="mt-2 font-sans text-sm text-starlight">输入注册邮箱，我们将发送重置链接</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="邮箱"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="captain@compass.app"
            autoComplete="email"
            required
          />

          {error && (
            <p className="rounded-lg border border-coral/30 bg-coral/10 px-4 py-2 font-sans text-sm text-coral">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-lg border border-brass bg-brass/10 px-8 py-3 text-lg font-medium text-brass transition-all hover:bg-brass/20 hover:shadow-[0_0_20px_rgba(201,162,39,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '发送中…' : '发送重置邮件'}
          </button>
        </form>

        <p className="mt-6 text-center font-sans text-sm text-starlight/60">
          想起来了？{' '}
          <Link href="/login" className="text-brass transition-colors hover:text-brass-light">
            返回登录
          </Link>
        </p>
      </div>
    </main>
  );
}

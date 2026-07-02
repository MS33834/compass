'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Input } from '@/components/ui/Input';
import { CompassRose } from '@/components/CompassRose';

// 登录页 —— 欢迎回来
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (!res || res.error) {
        setError('邮箱或密码错误，请重试');
        setLoading(false);
        return;
      }
      router.push('/dashboard');
    } catch {
      setError('登录失败，请稍后重试');
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-abyss px-6 py-12">
      {/* 背景罗盘装饰 */}
      <CompassRose className="animate-spin-slow pointer-events-none absolute left-1/2 top-1/2 h-[125vmin] w-[125vmin] -translate-x-1/2 -translate-y-1/2 text-starlight opacity-[0.05]" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-starlight/15 bg-abyss-50/40 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl text-ivory sm:text-4xl">欢迎回来</h1>
          <p className="mt-2 font-sans text-sm text-starlight">继续你的航程</p>
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
          <Input
            label="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
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
            {loading ? '登录中…' : '登录'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between font-sans text-sm">
          <Link href="/forgot-password" className="text-starlight transition-colors hover:text-brass">
            忘记密码？
          </Link>
          <span className="text-starlight/60">
            还没有账户？{' '}
            <Link href="/register" className="text-brass transition-colors hover:text-brass-light">
              注册
            </Link>
          </span>
        </div>
      </div>
    </main>
  );
}

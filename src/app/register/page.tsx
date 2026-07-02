'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Input } from '@/components/ui/Input';
import { CompassRose } from '@/components/CompassRose';

// 注册页 —— 开始你的航程
export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1. 创建账户
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? '注册失败，请重试');
        setLoading(false);
        return;
      }
      // 2. 注册成功后自动登录
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (!result || result.error) {
        // 自动登录失败则引导至登录页
        router.push('/login');
        return;
      }
      router.push('/onboarding');
    } catch {
      setError('网络异常，请重试');
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-abyss px-6 py-12">
      {/* 背景罗盘装饰 */}
      <CompassRose className="animate-spin-slow pointer-events-none absolute left-1/2 top-1/2 h-[125vmin] w-[125vmin] -translate-x-1/2 -translate-y-1/2 text-starlight opacity-[0.05]" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-starlight/15 bg-abyss-50/40 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl text-ivory sm:text-4xl">开始你的航程</h1>
          <p className="mt-2 font-sans text-sm text-starlight">建立账户，锚定你的真北</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="姓名"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="你的称呼"
            autoComplete="name"
            required
          />
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
            placeholder="至少 8 位"
            autoComplete="new-password"
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
            {loading ? '注册中…' : '注册'}
          </button>
        </form>

        <p className="mt-6 text-center font-sans text-sm text-starlight/60">
          已有账户？{' '}
          <Link href="/login" className="text-brass transition-colors hover:text-brass-light">
            登录
          </Link>
        </p>
      </div>
    </main>
  );
}

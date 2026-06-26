/// <reference types="vite/client" />
// 指南 · 人物手绘肖像
//
// 真正的全人像留给设计师二次出图。
// 此处先用 <img> 加载 public/portraits/.../ 下的水墨写意 SVG。
// 加载失败时显示占位卡片。

import type { Figure } from '../domain/figures/figure.types';
import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { pickLang } from '../domain/i18n';

const BASE = import.meta.env.BASE_URL;

type Props = { figure: Figure };

export function Portrait({ figure }: Props) {
  const [err, setErr] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const locale = useStore(s => s.locale);

  // figure 变化时重置错误状态，避免复用组件实例时残留旧图的降级态
  useEffect(() => {
    setErr(false);
    setLoaded(false);
  }, [figure.id]);

  if (err) {
    return <Placeholder figure={figure} locale={locale} />;
  }

  // 确保子路径下 portrait 路径解析正确，避免 BASE 与相对路径拼接产生重复斜杠
  const portraitSrc = figure.portrait.startsWith('/')
    ? figure.portrait
    : `${BASE.replace(/\/$/, '')}/${figure.portrait}`;

  // A11Y-005: compute accessible name once, reuse for both <img alt> and wrapper aria-label
  const accessibleName = `${pickLang(figure.name, locale)} — ${pickLang(figure.era, locale)}`;

  return (
    <>
      {!loaded && <LoadingSkeleton />}
      <Frame accessibleName={accessibleName}>
        <img
          src={portraitSrc}
          alt={accessibleName}
          loading="lazy"
          onError={() => setErr(true)}
          onLoad={() => setLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'scale(1)' : 'scale(1.03)',
            transition: 'opacity 800ms var(--ease-out), transform 1200ms var(--ease-out)',
          }}
        />
      </Frame>
    </>
  );
}

function Frame({ children, accessibleName }: { children: React.ReactNode; accessibleName: string }) {
  // A11Y-005: wrapper div has role="img" + aria-label so screen readers
  // treat the portrait as a single image landmark; the inner <img> also
  // carries alt (both are fine — redundancy doesn't hurt).
  return (
    <div
      className="cp-portrait cp-portrait-frame"
      style={{
        width: '100%',
        aspectRatio: '3 / 4',
        position: 'relative',
        overflow: 'hidden',
      }}
      role="img"
      aria-label={accessibleName}
    >
      {children}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div
      aria-hidden
      style={{
        width: '100%',
        aspectRatio: '3 / 4',
        background: 'var(--rice-warm)',
        overflow: 'hidden',
        marginBottom: '0.5rem',
        position: 'relative',
      }}
    >
      <div
        className="cp-shimmer"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
      />
    </div>
  );
}

function Placeholder({ figure, locale }: Props & { locale: 'zh' | 'en' }) {
  const name = pickLang(figure.name, locale);
  return (
    // A11Y-005: 当 img 加载失败时，fallback 也必须有 role="img" + aria-label
    <div
      className="cp-portrait cp-portrait-frame"
      style={{
        width: '100%',
        aspectRatio: '3 / 4',
        background: 'var(--rice-warm)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
      role="img"
      aria-label={`${name} — ${pickLang(figure.era, locale)}`}
    >
      <div
        style={{
          fontSize: '0.875rem',
          color: 'var(--ink-soft)',
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.2em',
        }}
      >
        {pickLang(figure.era, locale)}
      </div>
      <div
        aria-hidden
        className="cp-seal-stamp"
        style={{
          fontSize: '5rem',
          color: 'var(--ink)',
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.05em',
          lineHeight: 1,
          textAlign: 'center',
        }}
      >
        {name.slice(0, 1)}
      </div>
      <div
        style={{
          fontSize: '1.25rem',
          color: 'var(--ink)',
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.2em',
        }}
      >
        {name}
      </div>
      <div
        style={{ position: 'absolute', right: '0.75rem', bottom: '0.75rem' }}
        className="cp-seal"
        aria-hidden
      >
        {name.slice(0, 1)}
      </div>
    </div>
  );
}

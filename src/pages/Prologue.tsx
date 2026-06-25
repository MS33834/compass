// 指南 · 入门 · 题
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useStore } from '../store';
import { BrushButton } from '../components/BrushButton';
import { Verse } from '../components/Verse';
import { useT } from '../i18n';

const PROLOGUE_SHOWN_KEY = 'cp_prologue_shown';

function getNextVerseIndex(total: number): number {
  try {
    const raw = localStorage.getItem(PROLOGUE_SHOWN_KEY);
    const shown: number[] = raw ? JSON.parse(raw) : [];
    const remaining = Array.from({ length: total }, (_, i) => i).filter(i => !shown.includes(i));
    if (remaining.length === 0) {
      // 所有诗句均已显示，重置记录
      localStorage.removeItem(PROLOGUE_SHOWN_KEY);
      return Math.floor(Math.random() * total);
    }
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    shown.push(pick);
    localStorage.setItem(PROLOGUE_SHOWN_KEY, JSON.stringify(shown));
    return pick;
  } catch {
    return Math.floor(Math.random() * total);
  }
}

export function Prologue() {
  const goPhase = useStore(s => s.goPhase);
  const t = useT();
  const sectionRef = useRef<HTMLElement>(null);
  // 用 useRef 缓存随机选择，懒初始化避免每次渲染都计算
  const pickRef = useRef<number | null>(null);
  if (pickRef.current === null) {
    pickRef.current = getNextVerseIndex(t.prologue.verses.length);
  }
  const pick = pickRef.current;
  const lines = t.prologue.verses[pick];

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(
        '.cp-prologue-seal',
        { scale: 2.2, opacity: 0, rotate: -8 },
        { scale: 1, opacity: 1, rotate: 0, duration: 0.8, ease: 'back.out(1.7)' }
      )
        .fromTo(
          '.cp-prologue-title',
          { opacity: 0, y: 20, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8 },
          '-=0.4'
        )
        .fromTo(
          '.cp-prologue-verse',
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 },
          '-=0.4'
        )
        .fromTo(
          '.cp-prologue-cta',
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.3'
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="cp-container-narrow" aria-labelledby="prologue-title">
      {/* 顶部装饰 */}
      <div
        aria-hidden
        className="cp-breathe"
        style={{
          textAlign: 'center',
          color: 'var(--ink-soft)',
          fontSize: '0.9rem',
          fontFamily: 'var(--font-accent)',
          letterSpacing: '0.5em',
          marginBottom: '1rem',
        }}
      >
        ✦ ─── ◆ ─── ✦
      </div>

      <div style={{ textAlign: 'center', padding: '3rem 0 2rem' }}>
        <div
          aria-hidden
          className="cp-prologue-seal cp-seal-large"
          style={{
            color: 'var(--cinnabar)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.3em',
            lineHeight: 1,
            marginBottom: '1.5rem',
          }}
        >
          {t.prologue.seal}
        </div>
        <h1 id="prologue-title" className="cp-prologue-title" style={{ marginBottom: '1rem' }}>
          {t.prologue.title}
        </h1>
        {/* 装饰分隔 */}
        <div
          aria-hidden
          className="cp-float"
          style={{
            color: 'var(--cinnabar)',
            fontSize: '1.2rem',
            letterSpacing: '0.8em',
            opacity: 0.5,
            marginTop: '0.5rem',
          }}
        >
          ◆ ◇ ◆
        </div>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        {lines.map((l, i) => (
          <div key={i} className="cp-prologue-verse">
            <Verse text={l.text} gloss={l.gloss} reveal />
          </div>
        ))}
      </div>

      {/* 中部装饰符号 */}
      <div
        aria-hidden
        className="cp-breathe"
        style={{
          textAlign: 'center',
          color: 'var(--ink-soft)',
          fontSize: '0.8rem',
          letterSpacing: '0.3em',
          margin: '2rem 0',
          fontFamily: 'var(--font-accent)',
        }}
      >
        ── 墨 · 心 · 指 ──
      </div>

      <div
        className="cp-prologue-cta"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginTop: '2rem',
        }}
      >
        <BrushButton variant="primary" onClick={() => goPhase('path')} data-testid="btn-enter">
          {t.prologue.enter}
        </BrushButton>
      </div>

      <p
        className="cp-prologue-cta"
        style={{
          textAlign: 'center',
          color: 'var(--ink-soft)',
          fontSize: '0.875rem',
          marginTop: '4rem',
          fontFamily: 'var(--font-accent)',
        }}
      >
        ◈ {t.prologue.privacy} ◈
      </p>

      {/* 底部装饰 */}
      <div
        aria-hidden
        className="cp-float-slow"
        style={{
          textAlign: 'center',
          color: 'var(--ink-soft)',
          fontSize: '0.75rem',
          letterSpacing: '0.4em',
          marginTop: '2rem',
        }}
      >
        ✧ · · ✧ · · ✧
      </div>
    </section>
  );
}

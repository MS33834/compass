// 指南 · 选域 · 路

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useStore } from '../store';
import { BrushButton } from '../components/BrushButton';
import { Verse } from '../components/Verse';
import { figuresCountForDomain } from '../domain/figures/figures.index';
import type { DomainId } from '../domain/figures/figure.types';
import { useT } from '../i18n';

type Region = 'east' | 'west';

const DOMAIN_REGION: Record<DomainId, Region> = {
  'east-literati': 'east',
  'east-statesman': 'east',
  'east-scientist': 'east',
  'west-philosopher': 'west',
  'west-scientist': 'west',
};

const REGION_KEYS: readonly DomainId[] = [
  'east-literati',
  'east-statesman',
  'east-scientist',
  'west-philosopher',
  'west-scientist',
];

const REGIONS: readonly Region[] = ['east', 'west'];

export function Path() {
  const selectDomain = useStore(s => s.selectDomain);
  const t = useT();
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [region, setRegion] = useState<Region>('east');
  const [picked, setPicked] = useState<DomainId | null>(null);

  const chosen = picked ? figuresCountForDomain(picked) : 0;
  const ready = picked !== null && chosen > 0;

  // 入场动画
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(
        '.cp-path-header',
        { opacity: 0, y: 18, filter: 'blur(4px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7 }
      )
        .fromTo(
          '.cp-path-tab',
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
          '-=0.4'
        )
        .fromTo(
          '.cp-domain-card',
          { opacity: 0, y: 24, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1 },
          '-=0.3'
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // 切换 region 时卡片重排动画
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !cardsRef.current) return;

    const ctx = gsap.context(() => {
      // P2-002: 先停掉旧动画，防止叠加抖动
      gsap.killTweensOf('.cp-domain-card');
      gsap.fromTo(
        '.cp-domain-card',
        { opacity: 0, y: 16, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }, cardsRef);

    return () => ctx.revert();
  }, [region]);

  const handleTabKeyDown = (e: React.KeyboardEvent, current: Region) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const idx = REGIONS.indexOf(current);
      const next =
        REGIONS[(idx + (e.key === 'ArrowRight' ? 1 : -1) + REGIONS.length) % REGIONS.length];
      setRegion(next);
      setPicked(null);
    }
  };

  return (
    <section ref={sectionRef} className="cp-container" aria-labelledby="path-title">
      {/* 顶部装饰 */}
      <div
        aria-hidden
        className="cp-breathe"
        style={{
          textAlign: 'center',
          color: 'var(--ink-soft)',
          fontSize: '0.8rem',
          letterSpacing: '0.6em',
          marginBottom: '1.5rem',
          fontFamily: 'var(--font-accent)',
        }}
      >
        ✦ ─── ◆ ─── ✦
      </div>

      <header className="cp-path-header">
        <h1 id="path-title">{t.path.title}</h1>
        <p
          style={{
            color: 'var(--ink-soft)',
            fontFamily: 'var(--font-accent)',
            fontSize: '1.05rem',
          }}
        >
          {t.path.prompt}
        </p>
      </header>

      {/* 东西方切换按钮 */}
      <div
        role="tablist"
        className="cp-path-tabs"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          position: 'relative',
        }}
      >
        {REGIONS.map(r => (
          <button
            key={r}
            role="tab"
            className="cp-path-tab"
            aria-selected={region === r}
            tabIndex={region === r ? 0 : -1}
            onKeyDown={e => handleTabKeyDown(e, r)}
            onClick={() => {
              setRegion(r);
              setPicked(null);
            }}
            style={{
              padding: '0.6rem 2rem',
              background: region === r ? 'var(--ink)' : 'transparent',
              color: region === r ? 'var(--rice)' : 'var(--ink)',
              border: '1.5px solid var(--ink)',
              fontFamily: 'var(--font-display)',
              fontSize: '1.125rem',
              letterSpacing: '0.25em',
              cursor: 'pointer',
              transition: 'all 300ms var(--ease-out)',
              boxShadow: region === r ? 'var(--shadow-soft)' : 'none',
            }}
          >
            {t.path.region[r]}
          </button>
        ))}
      </div>

      {/* 域卡片网格 */}
      <div ref={cardsRef} className="cp-domain-grid">
        {REGION_KEYS.filter(d => DOMAIN_REGION[d] === region).map(d => {
          const count = figuresCountForDomain(d);
          const meta = t.path.domains[d];
          const readyFlag = count > 0;
          const active = picked === d;
          return (
            <button
              key={d}
              type="button"
              data-domain={d}
              data-ready={readyFlag ? 'true' : 'false'}
              data-testid={`domain-card-${d}`}
              onClick={() => readyFlag && setPicked(d)}
              disabled={!readyFlag}
              aria-pressed={active}
              aria-label={`${meta.name} · ${meta.sub}`}
              title={!readyFlag ? t.path.domainUnderDev : undefined}
              className={`cp-domain-card cp-card-hover${active ? ' cp-selected-corner' : ''}${!readyFlag ? ' cp-domain-card--disabled' : ''}`}
              data-selected-label={active ? t.path.selected : undefined}
              style={{
                background: active ? 'var(--rice-warm)' : 'transparent',
                borderColor: active ? 'var(--cinnabar)' : 'var(--rice-deep)',
                cursor: readyFlag ? 'pointer' : 'not-allowed',
              transition: 'all 300ms var(--ease-out), transform 300ms var(--ease-out)',
                opacity: readyFlag ? 1 : 0.5,
              }}
            >
              <h2
                style={{
                  marginBottom: '0.75rem',
                  fontSize: '1.35rem',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.15em',
                }}
              >
                {meta.name}
              </h2>
              <p
                style={{
                  color: 'var(--ink-soft)',
                  fontSize: '0.9rem',
                  margin: '0 0 1rem 0',
                  lineHeight: 1.7,
                  wordBreak: 'keep-all',
                  overflowWrap: 'break-word',
                  maxWidth: '100%',
                  alignSelf: 'stretch',
                  textAlign: 'center',
                }}
              >
                {meta.sub}
              </p>
              <p
                style={{
                  marginTop: 'auto',
                  fontFamily: 'var(--font-display)',
                  color: readyFlag ? 'var(--jade)' : 'var(--ash)',
                  fontSize: '0.95rem',
                  letterSpacing: '0.1em',
                }}
              >
                {readyFlag ? t.path.peopleCount(count) : t.path.pending}
              </p>
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="cp-fade-enter cp-path-picked" style={{ textAlign: 'center' }}>
          {/* 装饰分隔 */}
          <div
            aria-hidden
            className="cp-float"
            style={{
              color: 'var(--cinnabar)',
              fontSize: '0.9rem',
              letterSpacing: '0.5em',
              opacity: 0.4,
              marginBottom: '1.5rem',
            }}
          >
            ── ◈ ──
          </div>
          <Verse
            text={`${t.path.region[DOMAIN_REGION[picked]]} · ${t.path.domains[picked].name}`}
            gloss={t.path.picked}
            reveal
          />
          <div style={{ marginTop: '2rem' }}>
            <BrushButton
              variant="primary"
              disabled={!ready}
              onClick={() => ready && selectDomain(picked)}
              data-testid="btn-start"
            >
              {t.path.start}
            </BrushButton>
          </div>
        </div>
      )}

      {/* 底部装饰 */}
      <div
        aria-hidden
        className="cp-float-slow"
        style={{
          textAlign: 'center',
          color: 'var(--ink-soft)',
          fontSize: '0.7rem',
          letterSpacing: '0.4em',
          marginTop: '3rem',
        }}
      >
        ✧ · · ✧ · · ✧
      </div>
    </section>
  );
}

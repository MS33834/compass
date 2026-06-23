// 指南 · 答题 · 行（固定视口版）
//
// 交互原则：
// 1. 答题页固定占满视口，不随内容上下滚动；内容在可视区内自适应排布。
// 2. 其他页面保持自然滚动。
// 3. 选项紧凑、题面清晰、底部导航始终可见。
// 4. 键盘导航保留：1-6 选答、← → 翻题、↑ ↓ 在未答时定位首/末项。

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useStore } from '../store';
import { itemsForDomain } from '../domain/items/items.index';
import { figuresForDomain } from '../domain/figures/figures.index';
import type { Item } from '../domain/items/item.types';
import type { Figure } from '../domain/figures/figure.types';
import { computeUserVector } from '../domain/matching/vector';
import { buildReport } from '../domain/matching/report';
import { BrushButton } from '../components/BrushButton';
import { ConfirmModal } from '../components/ConfirmModal';
import { useT } from '../i18n';

const NO_SCROLL_CLASS = 'cp-way-no-scroll';

export function Way() {
  const phase = useStore(s => s.phase);
  const domain = useStore(s => s.domain);
  const currentIndex = useStore(s => s.currentIndex);
  const answers = useStore(s => s.answers);
  const answer = useStore(s => s.answer);
  const goPrev = useStore(s => s.goPrev);
  const goNext = useStore(s => s.goNext);
  const clampIndex = useStore(s => s.clampIndex);
  const goPhase = useStore(s => s.goPhase);
  const setReport = useStore(s => s.setReport);
  const reset = useStore(s => s.reset);
  const locale = useStore(s => s.locale);
  const theme = useStore(s => s.theme);
  const setLocale = useStore(s => s.setLocale);
  const setTheme = useStore(s => s.setTheme);
  const t = useT();

  // 挂载时禁止 body 滚动，卸载时恢复（仅影响答题页）
  useEffect(() => {
    document.body.classList.add(NO_SCROLL_CLASS);
    return () => document.body.classList.remove(NO_SCROLL_CLASS);
  }, []);

  // 只在真正处于 way 阶段时做无 domain 回跳，避免 reset() 切到 prologue 时被覆盖回 path
  useEffect(() => {
    if (phase !== 'way') return;
    if (!domain) goPhase('path');
  }, [phase, domain, goPhase]);

  const [items, setItems] = useState<readonly Item[]>([]);
  const [figures, setFigures] = useState<readonly Figure[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showHomeConfirm, setShowHomeConfirm] = useState(false);

  useEffect(() => {
    if (!domain) {
      setItems([]);
      setFigures([]);
      setLoading(false);
      setLoadAttempted(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadAttempted(false);
    Promise.all([itemsForDomain(domain), figuresForDomain(domain)])
      .then(([loadedItems, loadedFigures]) => {
        if (cancelled) return;
        setItems(loadedItems);
        setFigures(loadedFigures);
        setLoading(false);
        setLoadAttempted(true);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('Compass: failed to load domain data', err);
        setItems([]);
        setFigures([]);
        setLoading(false);
        setLoadAttempted(true);
      });
    return () => {
      cancelled = true;
    };
  }, [domain]);

  const total = items.length;
  const item = items[currentIndex];

  // 加载完成后若下标越界，则回 Clamp 到合法范围，避免白屏或误跳转
  useEffect(() => {
    if (loadAttempted && !loading && total > 0 && currentIndex >= total) {
      clampIndex(total - 1);
    }
  }, [loadAttempted, loading, total, currentIndex, clampIndex]);

  // 越界保护：加载已完成但仍无题目时，重定向到选域页（而非 prologue，避免丢失进度）
  useEffect(() => {
    if (domain && loadAttempted && !loading && !item) goPhase('path');
  }, [domain, loadAttempted, loading, item, goPhase]);

  // 回溯提示
  const [showBacktrack, setShowBacktrack] = useState(false);
  useEffect(() => {
    const hasUnansweredBefore = items
      .slice(0, currentIndex)
      .some(it => answers[it.id] === undefined);
    setShowBacktrack(hasUnansweredBefore);
  }, [currentIndex, answers, items]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const questionRef = useRef<HTMLElement | null>(null);

  // 切题时内部滚动区回到顶部 + 水墨翻页动效
  useLayoutEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [currentIndex]);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !questionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        questionRef.current,
        { opacity: 0, x: 24, filter: 'blur(4px)' },
        { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.45, ease: 'power2.out' }
      );
      gsap.fromTo(
        '.cp-way-option',
        { opacity: 0, x: 12 },
        { opacity: 1, x: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out', delay: 0.1 }
      );
    }, questionRef);

    return () => ctx.revert();
  }, [currentIndex]);

  // 越界保护：重定向到选域页（而非 prologue，避免丢失进度）
  // 注意：必须在所有 hooks 之前 return，否则违反 Rules of Hooks
  const current = item ? answers[item.id] : undefined;
  const answeredCount = Object.keys(answers).length;
  const canFinish = answeredCount >= 30;

  const handleFinish = useCallback(() => {
    if (!item) return;
    const r = buildReport(computeUserVector(answers, items), figures, answers, items);
    if (r) setReport(r);
  }, [answers, items, figures, setReport, item]);

  const handleSkip = () => {
    if (currentIndex < total - 1) goNext();
  };

  // 键盘导航（必须在 return null 之前注册，遵守 Rules of Hooks）
  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight' && currentIndex < total - 1) {
        if (current !== undefined) {
          e.preventDefault();
          goNext();
        }
      } else if (e.key === 'ArrowUp' && current === undefined) {
        e.preventDefault();
        answer(item.id, item.options.length - 1);
      } else if (e.key === 'ArrowDown' && current === undefined) {
        e.preventDefault();
        answer(item.id, 0);
      } else if (e.key >= '1' && e.key <= '6') {
        const optIndex = parseInt(e.key) - 1;
        if (optIndex < item.options.length) {
          e.preventDefault();
          answer(item.id, optIndex);
        }
      } else if (e.key === 'Enter') {
        if (currentIndex < total - 1 && current !== undefined) {
          e.preventDefault();
          goNext();
        } else if (canFinish) {
          e.preventDefault();
          handleFinish();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, total, current, item, answer, goPrev, goNext, canFinish, handleFinish]);

  if (!domain || loading || !item) {
    return (
      <section className="cp-way-shell" aria-live="polite">
        <div className="cp-way-loading">{t.ui.loading}</div>
      </section>
    );
  }

  const progressPct = Math.round((answeredCount / total) * 100);
  const currentProgressPct = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <section className="cp-way-shell" aria-labelledby="way-title">
      {/* 顶部：进度 + 题号 + 回溯提示 + 主题/语言切换 */}
      <header className="cp-way-header">
        <div className="cp-way-progress cp-progress-glow" aria-hidden>
          <div className="cp-way-progress-current" style={{ width: `${currentProgressPct}%` }} />
          <div className="cp-way-progress-answered" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="cp-way-topbar">
          <p className="cp-way-meta" data-testid="way-progress-text">
            <span>{t.way.question(currentIndex + 1, total)}</span>
            <span>{t.way.answered(answeredCount, total)}</span>
          </p>

          <div className="cp-way-controls">
            <button
              type="button"
              className="cp-way-control"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? t.ui.themeLabelLight : t.ui.themeLabelDark}
              aria-label={theme === 'dark' ? t.ui.themeLabelLight : t.ui.themeLabelDark}
              data-testid="way-btn-theme"
            >
              {theme === 'dark' ? t.ui.themeLight : t.ui.themeDark}
            </button>
            <button
              type="button"
              className="cp-way-control"
              onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
              aria-label={t.ui.toggleLang}
              data-testid="way-btn-lang"
            >
              {t.ui.toggleLang}
            </button>
            <button
              type="button"
              className="cp-way-control"
              onClick={() => setShowHomeConfirm(true)}
              aria-label={t.ui.returnHome}
              data-testid="way-btn-home"
            >
              {t.ui.returnHome}
            </button>
          </div>
        </div>

        {showBacktrack && <div className="cp-way-backtrack">{t.way.backtrackHint}</div>}
      </header>

      {/* 中间：题目 + 选项，内容过多时可内部滚动 */}
      <div ref={scrollRef} className="cp-way-scroll">
        <article
          ref={questionRef}
          key={item.id}
          className="cp-way-question"
          aria-labelledby="way-title"
        >
          <h2 id="way-title" data-testid="way-prompt" className="cp-way-prompt">
            {item.prompt}
          </h2>
          {item.promptGloss && <p className="cp-way-gloss">{item.promptGloss}</p>}

          <div role="radiogroup" aria-label={t.way.optionsLabel} className="cp-way-options">
            {item.options.map((opt, i) => {
              const selected = current === i;
              const letter = String.fromCharCode(65 + i);
              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={selected ? 0 : -1}
                  className={`cp-way-option${selected ? ' cp-way-option--selected' : ''}`}
                  data-role="option"
                  data-opt-index={i}
                  data-testid={`option-${i}`}
                  onClick={e => {
                    const btn = e.currentTarget;
                    const rect = btn.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    btn.style.setProperty('--opt-ripple-x', `${x}%`);
                    btn.style.setProperty('--opt-ripple-y', `${y}%`);
                    answer(item.id, i);
                  }}
                >
                  <span className="cp-way-letter" aria-hidden>
                    {letter}
                  </span>
                  <span className="cp-way-option-text">
                    <span className="cp-way-ancient">{opt.text}</span>
                    {opt.gloss && <span className="cp-way-gloss-inline">{opt.gloss}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </article>
      </div>

      {/* 底部：导航 + 提示 + 重置 */}
      <footer className="cp-way-footer">
        <nav className="cp-way-nav" data-testid="way-nav">
          <BrushButton
            variant="ghost"
            onClick={goPrev}
            disabled={currentIndex === 0}
            data-testid="btn-prev"
          >
            {t.way.prev}
          </BrushButton>

          {currentIndex < total - 1 && (
            <BrushButton
              variant="ghost"
              onClick={handleSkip}
              data-testid="btn-skip"
              style={{ opacity: current === undefined ? 1 : 0.7 }}
            >
              {current === undefined ? t.way.skipThis : t.way.skip}
            </BrushButton>
          )}

          {currentIndex === total - 1 ? (
            <BrushButton
              variant="primary"
              data-testid="btn-finish"
              disabled={!canFinish}
              onClick={handleFinish}
              title={!canFinish ? t.way.finishTitle(30 - answeredCount) : undefined}
            >
              {t.way.finish}
            </BrushButton>
          ) : (
            <BrushButton
              variant="primary"
              data-testid="btn-next"
              onClick={goNext}
              disabled={current === undefined}
            >
              {t.way.next}
            </BrushButton>
          )}
        </nav>

        <p className="cp-way-hint">{t.way.keyboardHint}</p>

        <button
          type="button"
          className="cp-way-reset"
          onClick={() => setShowResetConfirm(true)}
        >
          {t.way.resetLabel}
        </button>
      </footer>

      <ConfirmModal
        open={showResetConfirm}
        title={t.way.resetLabel}
        message={t.ui.resetConfirm}
        confirmLabel={t.ui.confirmYes}
        cancelLabel={t.ui.confirmNo}
        onConfirm={() => {
          setShowResetConfirm(false);
          reset();
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
      <ConfirmModal
        open={showHomeConfirm}
        title={t.ui.returnHome}
        message={t.ui.returnHomeConfirm}
        confirmLabel={t.ui.confirmYes}
        cancelLabel={t.ui.confirmNo}
        onConfirm={() => {
          setShowHomeConfirm(false);
          reset();
        }}
        onCancel={() => setShowHomeConfirm(false)}
      />
    </section>
  );
}

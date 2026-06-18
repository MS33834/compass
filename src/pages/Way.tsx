// 指南 · 答题 · 行（固定视口版）
//
// 交互原则：
// 1. 答题页固定占满视口，不随内容上下滚动；内容在可视区内自适应排布。
// 2. 其他页面保持自然滚动。
// 3. 选项紧凑、题面清晰、底部导航始终可见。
// 4. 键盘导航保留：1-6 选答、← → 翻题、↑ ↓ 在未答时定位首/末项。

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../store';
import { itemsForDomain } from '../domain/items/items.index';
import { figuresForDomain } from '../domain/figures/figures.index';
import { computeUserVector } from '../domain/matching/vector';
import { buildReport } from '../domain/matching/report';
import { BrushButton } from '../components/BrushButton';
import { useT } from '../i18n';

const NO_SCROLL_CLASS = 'cp-way-no-scroll';

export function Way() {
  const domain = useStore(s => s.domain);
  const currentIndex = useStore(s => s.currentIndex);
  const answers = useStore(s => s.answers);
  const answer = useStore(s => s.answer);
  const goPrev = useStore(s => s.goPrev);
  const goNext = useStore(s => s.goNext);
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

  useEffect(() => {
    if (!domain) goPhase('path');
  }, [domain, goPhase]);

  const items = useMemo(() => itemsForDomain(domain ?? 'east-literati'), [domain]);
  const total = items.length;
  const item = items[currentIndex];
  const figures = useMemo(() => (domain ? figuresForDomain(domain) : []), [domain]);

  // 越界保护：重定向到选域页（而非 prologue，避免丢失进度）
  useEffect(() => {
    if (domain && !item) goPhase('path');
  }, [domain, item, goPhase]);

  // 回溯提示
  const [showBacktrack, setShowBacktrack] = useState(false);
  useEffect(() => {
    const hasUnansweredBefore = items
      .slice(0, currentIndex)
      .some(it => answers[it.id] === undefined);
    setShowBacktrack(hasUnansweredBefore);
  }, [currentIndex, answers, items]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // 切题时内部滚动区回到顶部
  useLayoutEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [currentIndex]);

  if (!domain || !item) return null;

  const current = answers[item.id];
  const answeredCount = Object.keys(answers).length;
  const canFinish = answeredCount >= 30;

  const handleFinish = useCallback(() => {
    const r = buildReport(computeUserVector(answers, items), figures, answers, items);
    setReport(r);
  }, [answers, items, figures, setReport]);

  const handleSkip = () => {
    if (currentIndex < total - 1) goNext();
  };

  // 键盘导航
  useEffect(() => {
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
        e.preventDefault();
        if (currentIndex < total - 1 && current !== undefined) {
          goNext();
        } else if (canFinish) {
          handleFinish();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, total, current, item, answer, goPrev, goNext, canFinish, handleFinish]);

  const progressPct = Math.round((answeredCount / total) * 100);
  const currentProgressPct = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <section className="cp-way-shell cp-page-enter" aria-labelledby="way-title">
      {/* 顶部：进度 + 题号 + 回溯提示 + 主题/语言切换 */}
      <header className="cp-way-header">
        <div className="cp-way-progress" aria-hidden>
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
          </div>
        </div>

        {showBacktrack && <div className="cp-way-backtrack">{t.way.backtrackHint}</div>}
      </header>

      {/* 中间：题目 + 选项，内容过多时可内部滚动 */}
      <div ref={scrollRef} className="cp-way-scroll">
        <article
          key={item.id}
          className="cp-way-question cp-fade-enter"
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
                  onClick={() => answer(item.id, i)}
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
          onClick={() => {
            if (confirm(t.ui.resetConfirm)) reset();
          }}
        >
          {t.way.resetLabel}
        </button>
      </footer>
    </section>
  );
}

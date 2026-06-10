// 镜心 · 答题 · 行

import { useMemo } from 'react';
import { useStore } from '../store';
import { itemsForDomain } from '../domain/items/items.index';
import { figuresForDomain } from '../domain/figures/figures.index';
import { computeUserVector } from '../domain/matching/vector';
import { buildReport } from '../domain/matching/report';
import { BrushButton } from '../components/BrushButton';
import { Progress } from '../components/Progress';
import { Verse } from '../components/Verse';

export function Way() {
  const { domain, currentIndex, answers, answer, goPrev, goNext, setReport, goPhase } = useStore();

  if (!domain) {
    goPhase('path');
    return null;
  }

  const items = useMemo(() => itemsForDomain(domain), [domain]);
  const total = items.length;
  const item = items[currentIndex];

  if (!item) {
    goPhase('reflection');
    return null;
  }

  const figures = figuresForDomain(domain);
  const total2 = total;
  void total2;

  const userVec = computeUserVector(answers, items);
  const report = buildReport(userVec, figures, answers, items);
  setReport(report);

  const current = answers[item.id];
  const answered = Object.keys(answers).length;
  const canFinish = answered >= 30;

  return (
    <section className="jx-container-narrow jx-fade-enter" aria-labelledby="way-title">
      <header style={{ marginBottom: '2rem' }}>
        <Progress value={answered} total={total} />
        <p
          style={{
            marginTop: '0.5rem',
            color: 'var(--ink-faint)',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.1em',
          }}
        >
          {answered} / {total} · 第 {currentIndex + 1} 问
        </p>
      </header>

      <article
        key={item.id}
        className="jx-fade-enter"
        aria-labelledby="way-title"
        style={{ minHeight: '16rem' }}
      >
        <h2 id="way-title" style={{ marginBottom: '1.5rem' }}>
          {item.prompt}
        </h2>
        {item.promptGloss && (
          <p style={{ color: 'var(--ink-faint)', marginBottom: '2rem' }}>{item.promptGloss}</p>
        )}

        <div role="radiogroup" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {item.options.map((opt, i) => {
            const selected = current === i;
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => answer(item.id, i)}
                style={{
                  textAlign: 'left',
                  padding: '1rem 1.25rem',
                  background: selected ? 'var(--rice-warm)' : 'transparent',
                  border: `1px solid ${selected ? 'var(--cinnabar)' : 'var(--rice-deep)'}`,
                  cursor: 'pointer',
                  transition: 'all 200ms',
                }}
              >
                <Verse text={opt.text} gloss={opt.gloss} />
              </button>
            );
          })}
        </div>
      </article>

      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '3rem',
          gap: '1rem',
        }}
      >
        <BrushButton variant="ghost" onClick={goPrev} disabled={currentIndex === 0}>
          上一问
        </BrushButton>

        {currentIndex === total - 1 ? (
          <BrushButton
            variant="primary"
            disabled={!canFinish}
            onClick={() => {
              const r = buildReport(computeUserVector(answers, items), figures, answers, items);
              setReport(r);
            }}
            title={!canFinish ? `再答 ${30 - answered} 题即可出镜` : undefined}
          >
            出镜
          </BrushButton>
        ) : (
          <BrushButton variant="primary" onClick={goNext} disabled={current === undefined}>
            下一问
          </BrushButton>
        )}
      </nav>
    </section>
  );
}

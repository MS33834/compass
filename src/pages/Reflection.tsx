// 指南 · 映照 · 卷（增强版）
//
// 增强点：
// 1. 主镜映照数字：从 0 动态累加到匹配度 —— 数字滚动动画
// 2. 同道列表卡片：逐张淡入 + 悬停微缩放 + 同道值渐增
// 3. 十二维卡片化：按差异排序的卡片网格 + 悬停详情 + 同/异/合 三态标签
// 4. 报告页整体卷轴展开

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useStore } from '../store';
import { TraitRadar } from '../components/TraitRadar';
import { Portrait } from '../components/Portrait';
import { BrushButton } from '../components/BrushButton';
import { Verse } from '../components/Verse';
import { TRAITS } from '../domain/traits/trait.dimensions';
import type { TraitVector } from '../domain/traits/trait.types';
import { itemsForDomain } from '../domain/items/items.index';
import { figuresForDomain } from '../domain/figures/figures.index';
import { computeUserVector } from '../domain/matching/vector';
import { buildReport } from '../domain/matching/report';
import { useT } from '../i18n';
import { exportState, encodeResume, downloadJSON, readJSONFile } from '../share';

// ── 工具：数字滚动动画 Hook ──
function useAnimatedNumber(target: number, durationMs = 1600, startMs = 200) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    // target 为 0 时不启动动画（避免刷新后 report=null 时动画锁定）
    if (target === 0) {
      setVal(0);
      return;
    }

    const t0 = performance.now() + startMs;
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - t0;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const p = Math.min(1, elapsed / durationMs);
      // ease-out cubic
      const e = 1 - Math.pow(1 - p, 3);
      setVal(target * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, startMs]);

  return val;
}

// ── 隔离动画组件：避免动画帧重渲染整个 Reflection 页 ──
function AnimatedNumber({
  target,
  durationMs,
  startMs,
  children,
}: {
  target: number;
  durationMs?: number;
  startMs?: number;
  children: (val: number) => ReactNode;
}) {
  const val = useAnimatedNumber(target, durationMs, startMs);
  return <>{children(val)}</>;
}

// ── 工具：逐维分类（同/近/异）
function traitDiffLabel(
  diff: number,
  labels: { same: string; close: string; diverge: string }
): { text: string; kind: 'same' | 'close' | 'diverge' } {
  if (diff < 0.08) return { text: labels.same, kind: 'same' };
  if (diff < 0.22) return { text: labels.close, kind: 'close' };
  return { text: labels.diverge, kind: 'diverge' };
}

export function Reflection() {
  const report = useStore(s => s.report);
  const domain = useStore(s => s.domain);
  const answers = useStore(s => s.answers);
  const goPhase = useStore(s => s.goPhase);
  const setReport = useStore(s => s.setReport);
  const reset = useStore(s => s.reset);
  const locale = useStore(s => s.locale);
  const theme = useStore(s => s.theme);
  const t = useT();
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const goPhaseRef = useRef(goPhase);
  goPhaseRef.current = goPhase;

  // flash 定时器：每次调用清除上一个，组件卸载时也清除
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flash = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1500);
  }, []);
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  // 刷新后报告丢失：可由 domain + answers 重新计算
  useEffect(() => {
    if (!report) {
      if (domain && Object.keys(answers).length >= 30) {
        const items = itemsForDomain(domain);
        const figures = figuresForDomain(domain);
        const r = buildReport(computeUserVector(answers, items), figures, answers, items);
        setReport(r);
      } else {
        goPhaseRef.current('prologue');
      }
    }
  }, [report, domain, answers, setReport]);

  // C17 同道 3 维高亮（必须在任何条件 return 之前）
  const top3 = useMemo<number[]>(() => {
    if (!report) return [];
    return [...report.traitBreakdown]
      .map(b => ({
        traitId: b.traitId,
        diff: Math.abs(b.user - b.figure),
      }))
      .sort((a, b) => a.diff - b.diff)
      .slice(0, 3)
      .map(x => x.traitId);
  }, [report]);

  // 最差异的 3 维
  const bottom3 = useMemo<number[]>(() => {
    if (!report) return [];
    return [...report.traitBreakdown]
      .map(b => ({
        traitId: b.traitId,
        diff: Math.abs(b.user - b.figure),
      }))
      .sort((a, b) => b.diff - a.diff)
      .slice(0, 3)
      .map(x => x.traitId);
  }, [report]);

  // 十二维：按差异从小到大排序后做卡片化呈现
  const sortedBreakdown = useMemo(
    () =>
      report
        ? [...report.traitBreakdown].sort((a, b) => {
            const da = Math.abs(a.user - a.figure);
            const db = Math.abs(b.user - b.figure);
            return da - db;
          })
        : [],
    [report]
  );

  if (!report) return null;

  const { primary, alternates, confidence: confVal } = report;

  // C18 分享
  const handleShare = async () => {
    const shareData = {
      title: t.share.title,
      text: `${t.share.text} — ${primary.figure.name} (${primary.figure.era})`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        flash(t.reflection.shareCopied);
      }
    } catch {
      /* user cancel */
    }
  };

  // C13 导出 JSON
  const handleExport = () => {
    const items = domain ? itemsForDomain(domain) : [];
    const maxIdx = Math.max(0, items.length - 1);
    const s = exportState({
      domain,
      currentIndex: Math.min(Object.keys(answers).length, maxIdx),
      answers,
      locale,
      theme,
    });
    downloadJSON(s);
  };

  // C13 复制续答 URL
  const handleCopyResume = async () => {
    const items = domain ? itemsForDomain(domain) : [];
    const maxIdx = Math.max(0, items.length - 1);
    const s = exportState({
      domain,
      currentIndex: Math.min(Object.keys(answers).length, maxIdx),
      answers,
      locale,
      theme,
    });
    const enc = encodeResume(s);
    const url = `${window.location.origin}${window.location.pathname}?resume=${enc}`;
    try {
      await navigator.clipboard.writeText(url);
      flash(t.reflection.shareCopied);
    } catch {
      flash(url);
    }
  };

  // C13 导入 JSON
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const s = await readJSONFile(f);
    if (s) {
      useStore.getState().importState(s);
      flash(t.reflection.imported);
    } else {
      flash(t.reflection.importFail);
    }
    e.target.value = '';
  };

  return (
    <article className="jx-container jx-scroll-reveal" aria-labelledby="ref-title">
      {/* 顶部装饰 */}
      <div
        aria-hidden
        style={{
          textAlign: 'center',
          color: 'var(--ink-faint)',
          fontSize: '0.8rem',
          letterSpacing: '0.6em',
          marginBottom: '1.5rem',
          opacity: 0.5,
          fontFamily: 'var(--font-accent)',
        }}
      >
        ✦ ─── ◆ ─── ✦
      </div>
      {/* 顶部印章与标题 */}
      <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <p
          style={{
            color: 'var(--ink-faint)',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.35em',
            marginBottom: '1rem',
          }}
        >
          {t.reflection.sealLabel}
        </p>
        <h1
          id="ref-title"
          data-figure="primary"
          style={{ marginBottom: '0.5rem', fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}
        >
          {primary.figure.name}
        </h1>
        <p style={{ color: 'var(--ink-faint)', fontSize: '1.05rem' }}>
          {primary.figure.era} ·{' '}
          <AnimatedNumber target={primary.score * 100} durationMs={1600} startMs={200}>
            {v => t.reflection.score(Math.round(v))}
          </AnimatedNumber>
        </p>
      </header>

      {/* ─ 主镜：人像 + 诗赋 ─ */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.6fr)',
          gap: '2rem',
          marginBottom: '3.5rem',
          textAlign: 'left',
        }}
        className="jx-ref-grid jx-primary-grid jx-stagger"
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <div style={{ maxWidth: '220px', width: '100%' }}>
            <Portrait figure={primary.figure} />
          </div>
        </div>
        <div>
          <div style={{ textAlign: 'left' }}>
            <Verse text={primary.figure.signature} gloss={primary.figure.bio} />
          </div>
          <div
            className="jx-blurb"
            style={{
              marginTop: '1.5rem',
              padding: '1.25rem 1.5rem',
              background: 'var(--rice-warm)',
              borderLeft: '3px solid var(--cinnabar)',
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem',
              lineHeight: 1.9,
              textAlign: 'left',
            }}
          >
            {primary.blurb}
          </div>

          {/* 置信度指示 */}
          {confVal < 0.7 && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                border: '1px dashed var(--gold-dim)',
                fontSize: '0.9rem',
                color: 'var(--ink-soft)',
                textAlign: 'center',
                fontFamily: 'var(--font-display)',
              }}
            >
              <AnimatedNumber target={confVal * 100} durationMs={1400} startMs={800}>
                {v => t.reflection.confidenceHint(Math.round(v))}
              </AnimatedNumber>
            </div>
          )}

          {primary.figure.anecdotes && primary.figure.anecdotes.length > 0 && (
            <details
              className="jx-anecdotes"
              style={{ marginTop: '1rem', color: 'var(--ink-faint)', fontSize: '0.9rem' }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                  color: 'var(--ink)',
                }}
              >
                {t.reflection.anecdote} ·▸
              </summary>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', textAlign: 'left' }}>
                {primary.figure.anecdotes.map((a, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--ink)' }}>{a.title}</strong>：{a.body}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </section>

      {/* ── 同道（其他 4 人） ── */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{t.reflection.samePath}</h2>
        <div
          className="jx-alt-grid jx-stagger"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(11rem, 100%), 1fr))',
            gap: '1rem',
            justifyContent: 'center',
          }}
        >
          {alternates.map((a, idx) => {
            const diff = Math.abs(a.score - primary.score);
            const isClose = diff < 0.05;
            return (
              <article
                key={a.figure.id}
                data-figure="alternate"
                data-figure-id={a.figure.id}
                className={`jx-alt-card${isClose ? ' jx-alt-close' : ''}`}
                style={{
                  padding: '1.25rem 1rem',
                  background: isClose ? 'var(--rice-warm)' : 'transparent',
                  border: `1px solid ${isClose ? 'var(--cinnabar)' : 'var(--rice-deep)'}`,
                  position: 'relative',
                  transition: 'all 300ms var(--ease-out)',
                  textAlign: 'center',
                }}
              >
                {idx === 0 && (
                  <span
                    className="jx-chip jx-chip-cinnabar"
                    style={{
                      position: 'absolute',
                      top: '-0.6rem',
                      right: '0.5rem',
                      fontSize: '0.75rem',
                      padding: '0.15rem 0.5rem',
                    }}
                  >
                    {t.reflection.mostSimilar}
                  </span>
                )}
                <h3 style={{ marginBottom: '0.3rem', fontSize: '1.25rem' }}>{a.figure.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-faint)', margin: 0 }}>
                  {a.figure.era}
                </p>
                <p
                  style={{
                    marginTop: '0.5rem',
                    fontFamily: 'var(--font-display)',
                    color: isClose ? 'var(--cinnabar)' : 'var(--jade)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                  }}
                >
                  {t.reflection.score(Math.round(a.score * 100))}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── 十二维 + 雷达 ── */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{t.reflection.twelve}</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)',
            gap: '2rem',
            alignItems: 'start',
          }}
          className="jx-ref-grid"
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <TraitRadar
              user={report.traitBreakdown.map(b => b.user) as TraitVector}
              figure={primary.figure.vector}
              size={400}
              ariaLabel={t.reflection.twelve}
            />
          </div>

          {/* 十二维差异卡片网格 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(140px, 100%), 1fr))',
              gap: '0.6rem',
            }}
            className="jx-stagger"
          >
            {sortedBreakdown.map((b, idx) => {
              const trait = TRAITS.find(tt => tt.id === b.traitId);
              if (!trait) return null;
              const highlight = top3.includes(b.traitId);
              const divergent = bottom3.includes(b.traitId);
              const diff = Math.abs(b.user - b.figure);
              const label = traitDiffLabel(diff, t.reflection.traitLabels);

              const userPct = Math.round(b.user * 100);
              const figPct = Math.round(b.figure * 100);

              let borderColor = 'var(--rice-deep)';
              let bg = 'transparent';
              if (highlight) {
                borderColor = 'var(--jade)';
                bg = 'rgba(74, 107, 84, 0.06)';
              }
              if (divergent) {
                borderColor = 'var(--cinnabar)';
                bg = 'rgba(168, 50, 46, 0.08)';
              }

              return (
                <div
                  key={b.traitId}
                  data-trait-id={b.traitId}
                  className="jx-trait-card"
                  style={{
                    padding: '0.8rem 0.75rem',
                    border: `1px solid ${borderColor}`,
                    background: bg,
                    textAlign: 'center',
                    fontFamily: 'var(--font-display)',
                    transition: 'all 250ms var(--ease-out)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.4rem',
                      fontSize: '0.75rem',
                    }}
                  >
                    <span
                      style={{
                        color:
                          label.kind === 'same'
                            ? 'var(--jade)'
                            : label.kind === 'close'
                              ? 'var(--gold-dim)'
                              : 'var(--cinnabar)',
                        fontWeight: 600,
                        letterSpacing: '0.15em',
                      }}
                    >
                      {label.text}
                    </span>
                    <span style={{ color: 'var(--ink-faint)', opacity: 0.6 }}>#{idx + 1}</span>
                  </div>
                  <div style={{ fontSize: '1.3rem', color: 'var(--ink)', marginBottom: '0.25rem' }}>
                    {trait.glyph}
                  </div>
                  <div
                    style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', marginBottom: '0.4rem' }}
                  >
                    {trait.name}
                  </div>

                  {/* 迷你条形图 */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      marginTop: '0.4rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.7rem',
                      }}
                    >
                      <span style={{ width: '1.2em', color: 'var(--ink)' }}>
                        {t.reflection.chartLabels.you}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: '4px',
                          background: 'var(--rice-deep)',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            width: `${userPct}%`,
                            height: '100%',
                            background: 'var(--ink)',
                            transition: 'width 1200ms ease',
                          }}
                        />
                      </div>
                      <span style={{ width: '2.2em', textAlign: 'right', color: 'var(--ink)' }}>
                        {userPct}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.7rem',
                      }}
                    >
                      <span style={{ width: '1.2em', color: 'var(--cinnabar)' }}>
                        {t.reflection.chartLabels.ancient}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: '4px',
                          background: 'var(--rice-deep)',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            width: `${figPct}%`,
                            height: '100%',
                            background: 'var(--cinnabar)',
                            transition: 'width 1200ms ease',
                          }}
                        />
                      </div>
                      <span
                        style={{ width: '2.2em', textAlign: 'right', color: 'var(--cinnabar)' }}
                      >
                        {figPct}
                      </span>
                    </div>
                  </div>

                  {/* 评论 */}
                  <div
                    style={{
                      marginTop: '0.5rem',
                      fontSize: '0.75rem',
                      color: 'var(--ink-faint)',
                      fontFamily: 'var(--font-body)',
                      lineHeight: 1.5,
                    }}
                  >
                    {b.comment}
                  </div>

                  {/* 高/低标签 */}
                  <div
                    style={{
                      marginTop: '0.4rem',
                      fontSize: '0.7rem',
                      color: 'var(--ink-faint)',
                      opacity: 0.7,
                      letterSpacing: '0.1em',
                    }}
                  >
                    {b.user - b.figure > 0.05
                      ? t.reflection.youExceed
                      : b.figure - b.user > 0.05
                        ? t.reflection.youFallShort
                        : t.reflection.youMatch}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 页脚操作 ── */}
      <footer
        style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'center',
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid var(--rice-deep)',
          flexWrap: 'wrap',
        }}
      >
        <BrushButton variant="primary" onClick={handleShare} data-testid="btn-share">
          {t.reflection.share}
        </BrushButton>
        <BrushButton onClick={handleCopyResume} data-testid="btn-copy-resume">
          {t.reflection.copyResume}
        </BrushButton>
        <BrushButton onClick={handleExport} data-testid="btn-export">
          {t.reflection.exportJSON}
        </BrushButton>
        <BrushButton onClick={() => fileRef.current?.click()} data-testid="btn-import">
          {t.reflection.importJSON}
        </BrushButton>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          onChange={handleImport}
          style={{ display: 'none' }}
          aria-hidden
        />
        <BrushButton
          variant="primary"
          onClick={() => goPhase('path')}
          data-testid="btn-change-domain"
        >
          {t.reflection.changeDomain}
        </BrushButton>
        <BrushButton
          onClick={() => {
            if (confirm(t.ui.resetConfirm)) reset();
          }}
          data-testid="btn-reset"
        >
          {t.reflection.reset}
        </BrushButton>
      </footer>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="jx-toast"
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--ink)',
            color: 'var(--rice)',
            padding: '0.5rem 1rem',
            fontFamily: 'var(--font-display)',
            fontSize: '0.875rem',
            borderRadius: '2px',
            zIndex: 100,
            animation: 'jx-fade-stagger 200ms var(--ease-out) both',
            maxWidth: '90vw',
            wordBreak: 'break-word',
          }}
        >
          {toast}
        </div>
      )}

      {/* 低置信度提示 */}
      {confVal < 0.6 && (
        <p
          style={{
            textAlign: 'center',
            color: 'var(--ash)',
            fontSize: '0.875rem',
            marginTop: '1.5rem',
            fontFamily: 'var(--font-display)',
          }}
        >
          {t.reflection.lowConfidence}
        </p>
      )}

      <style>{`
        .jx-alt-card:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 20px rgba(168,50,46,0.12);
        }
        .jx-trait-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(26,26,26,0.08);
        }
      `}</style>
    </article>
  );
}

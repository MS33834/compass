// 指南 · 映照 · 卷

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useStore } from '../store';

// Toast 动态时长常量
const TOAST_BASE_MS = 1500;
const TOAST_PER_CHAR_MS = 50;
const TOAST_MAX_MS = 4000;
// 分数数字动画常量
const PRIMARY_SCORE_DURATION_MS = 1600;
const PRIMARY_SCORE_START_MS = 200;
const CONF_VAL_DURATION_MS = 1400;
const CONF_VAL_START_MS = 500;
import { TraitRadar } from '../components/TraitRadar';
import { Portrait } from '../components/Portrait';
import { BrushButton } from '../components/BrushButton';
import { ConfirmModal } from '../components/ConfirmModal';
import { Verse } from '../components/Verse';
import { TRAITS } from '../domain/traits/trait.dimensions';
import type { TraitVector } from '../domain/traits/trait.types';
import { itemsForDomain } from '../domain/items/items.index';
import { figuresForDomain } from '../domain/figures/figures.index';
import { computeUserVector } from '../domain/matching/vector';
import { buildReport } from '../domain/matching/report';
import { pickLang } from '../domain/i18n';
import { useT } from '../i18n';
import { ShareCard } from '../components/ShareCard';
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
  const phase = useStore(s => s.phase);
  const report = useStore(s => s.report);
  const domain = useStore(s => s.domain);
  const answers = useStore(s => s.answers);
  const goPhase = useStore(s => s.goPhase);
  const setReport = useStore(s => s.setReport);
  const reset = useStore(s => s.reset);
  const viewFigure = useStore(s => s.viewFigure);
  const locale = useStore(s => s.locale);
  const theme = useStore(s => s.theme);
  const t = useT();
  const [toast, setToast] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const goPhaseRef = useRef(goPhase);
  goPhaseRef.current = goPhase;

  // flash 定时器：每次调用清除上一个，组件卸载时也清除
  // 根据消息长度动态调整显示时间
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flash = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    const duration = Math.min(
      TOAST_BASE_MS + msg.length * TOAST_PER_CHAR_MS,
      TOAST_MAX_MS
    );
    toastTimer.current = setTimeout(() => setToast(null), duration);
  }, []);
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  // 刷新后报告丢失：可由 domain + answers 重新计算
  useEffect(() => {
    if (phase !== 'reflection') return;
    if (report) return;
    if (!domain || Object.keys(answers).length < 30) {
      goPhaseRef.current('prologue');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [items, figures] = await Promise.all([
          itemsForDomain(domain),
          figuresForDomain(domain),
        ]);
        if (cancelled) return;
        const r = buildReport(computeUserVector(answers, items), figures, answers, items, locale);
        if (r) setReport(r);
        else goPhaseRef.current('prologue');
      } catch (err) {
        if (cancelled) return;
        console.error('Compass: failed to rebuild report', err);
        goPhaseRef.current('prologue');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, report, domain, answers, setReport, locale]);

  // 同道 3 维高亮（必须在任何条件 return 之前）
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

  if (!report) {
    return (
      <section className="cp-ref-shell" aria-live="polite">
        <div className="cp-ref-loading">{t.ui.loading}</div>
      </section>
    );
  }

  const { primary, alternates, confidence: confVal } = report;

  // 分享
  const handleShare = async () => {
    const shareData = {
      title: t.share.title,
      text: `${t.share.text} — ${pickLang(primary.figure.name, locale)} (${pickLang(primary.figure.era, locale)})`,
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

  // 导出 JSON
  const handleExport = async () => {
    try {
      const items = domain ? await itemsForDomain(domain) : [];
      const maxIdx = Math.max(0, items.length - 1);
      const s = exportState({
        domain,
        currentIndex: Math.min(Object.keys(answers).length, maxIdx),
        answers,
        locale,
        theme,
      });
      downloadJSON(s);
    } catch (err) {
      console.error('Compass: failed to export answers', err);
    }
  };

  // 复制续答 URL
  const handleCopyResume = async () => {
    try {
      const items = domain ? await itemsForDomain(domain) : [];
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
    } catch (err) {
      console.error('Compass: failed to copy resume link', err);
    }
  };

  // 导入 JSON
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
    <article className="cp-container cp-scroll-reveal" aria-labelledby="ref-title">
      {/* 顶部装饰 */}
      <div
        aria-hidden
        style={{
          textAlign: 'center',
          color: 'var(--ink-soft)',
          fontSize: '0.8rem',
          letterSpacing: '0.6em',
          marginBottom: '1.5rem',
          opacity: 0.35,
          fontFamily: 'var(--font-accent)',
        }}
      >
        ✦ ─── ◆ ─── ✦
      </div>
      {/* 顶部印章与标题 */}
      <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <p
          style={{
            color: 'var(--ink-soft)',
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
          {pickLang(primary.figure.name, locale)}
        </h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: '1.05rem' }}>
          {pickLang(primary.figure.era, locale)} ·{' '}
          <AnimatedNumber target={primary.score * 100} durationMs={PRIMARY_SCORE_DURATION_MS} startMs={PRIMARY_SCORE_START_MS}>
            {v => t.reflection.score(Math.round(v))}
          </AnimatedNumber>
        </p>
      </header>

      {/* ── 置信度提示（顶部醒目位置） ── */}
      {confVal < 0.7 && (
        <div
          style={{
            textAlign: 'center',
            marginBottom: '2rem',
            padding: '0.625rem 1rem',
            background: 'var(--rice-warm)',
            border: '1px solid var(--gold-dim)',
            borderRadius: '2px',
            fontSize: '0.9rem',
            color: 'var(--ink-soft)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.08em',
          }}
        >
          <AnimatedNumber target={confVal * 100} durationMs={CONF_VAL_DURATION_MS} startMs={CONF_VAL_START_MS}>
            {v =>
              v > 50
                ? t.reflection.confidenceHint(Math.round(v))
                : t.reflection.lowConfidence
            }
          </AnimatedNumber>
        </div>
      )}

      {/* ─ 主区：人像 + 诗赋 ─ */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.6fr)',
          gap: '2rem',
          marginBottom: '3.5rem',
          textAlign: 'left',
        }}
        className="cp-ref-grid cp-primary-grid cp-stagger"
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <button
            type="button"
            data-figure-portrait
            onClick={() => viewFigure(primary.figure.id)}
            aria-label={`${pickLang(primary.figure.name, locale)} · ${t.figureDetail.bio}`}
            style={{
              /* MOB-001: 移除 inline maxWidth，让 CSS @media 规则在各种断点生效 */
              width: '100%',
              maxWidth: '220px',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            <Portrait figure={primary.figure} />
          </button>
        </div>
        <div>
          <div style={{ textAlign: 'left' }}>
            <Verse
              text={pickLang(primary.figure.signature, locale)}
              gloss={pickLang(primary.figure.bio, locale)}
            />
          </div>
          <div
            className="cp-blurb"
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

          {primary.figure.anecdotes && primary.figure.anecdotes.length > 0 && (
            <details
              className="cp-anecdotes"
              style={{ marginTop: '1rem', color: 'var(--ink-soft)', fontSize: '0.9rem' }}
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
                    <strong style={{ color: 'var(--ink)' }}>{pickLang(a.title, locale)}</strong>：
                    {pickLang(a.body, locale)}
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
          className="cp-alt-grid cp-stagger"
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
              <button
                type="button"
                key={a.figure.id}
                data-figure="alternate"
                data-figure-id={a.figure.id}
                aria-label={`${pickLang(a.figure.name, locale)} · ${pickLang(a.figure.era, locale)}`}
                onClick={() => viewFigure(a.figure.id)}
                className={`cp-alt-card${isClose ? ' cp-alt-close' : ''}`}
                style={{
                  padding: '1.25rem 1rem',
                  background: isClose ? 'var(--rice-warm)' : 'transparent',
                  border: `1px solid ${isClose ? 'var(--cinnabar)' : 'var(--rice-deep)'}`,
                  position: 'relative',
                  transition: 'all 300ms var(--ease-out)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  width: '100%',
                  fontFamily: 'inherit',
                  color: 'inherit',
                }}
              >
                {idx === 0 && (
                  <span
                    className="cp-chip cp-chip-cinnabar"
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
                <h3 style={{ marginBottom: '0.3rem', fontSize: '1.25rem' }}>
                  {pickLang(a.figure.name, locale)}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-soft)', margin: 0 }}>
                  {pickLang(a.figure.era, locale)}
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
              </button>
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
          className="cp-ref-grid"
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(170px, 100%), 1fr))',
              gap: '0.8rem',
            }}
            className="cp-stagger cp-trait-grid"
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
                  className="cp-trait-card"
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
                    <span aria-hidden style={{ color: 'var(--ink-soft)', opacity: 0.75 }}>
                      #{idx + 1}
                    </span>
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
                      color: 'var(--ink-soft)',
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
                      color: 'var(--ink-soft)',
                      opacity: 0.85,
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
      <footer className="cp-ref-section cp-ref-actions">
        <div className="cp-ref-actions-group cp-ref-actions-primary">
          <BrushButton variant="primary" onClick={handleShare} data-testid="btn-share">
            {t.reflection.share}
          </BrushButton>
          <BrushButton
            variant="primary"
            onClick={() => setShowShareCard(true)}
            data-testid="btn-open-share-card"
          >
            {t.shareCard.title}
          </BrushButton>
          <BrushButton
            variant="primary"
            onClick={() => setShowResetConfirm(true)}
            data-testid="btn-reset"
          >
            {t.reflection.reset}
          </BrushButton>
        </div>
        <div className="cp-ref-actions-group cp-ref-actions-secondary">
          <BrushButton onClick={handleCopyResume} data-testid="btn-copy-resume">
            {t.reflection.copyResume}
          </BrushButton>
          <BrushButton
            variant="ghost"
            onClick={() => goPhase('path')}
            data-testid="btn-change-domain"
          >
            {t.reflection.changeDomain}
          </BrushButton>
        </div>
        <div className="cp-ref-actions-group cp-ref-actions-data">
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
        </div>
      </footer>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="cp-toast"
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
            animation: 'cp-fade-stagger 200ms var(--ease-out) both',
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
        .cp-alt-card:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 20px rgba(168,50,46,0.12);
        }
        .cp-trait-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(26,26,26,0.08);
        }
      `}</style>

      <ConfirmModal
        open={showResetConfirm}
        title={t.reflection.reset}
        message={t.ui.resetConfirm}
        confirmLabel={t.ui.confirmYes}
        cancelLabel={t.ui.confirmNo}
        onConfirm={() => {
          setShowResetConfirm(false);
          reset();
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
      {showShareCard && <ShareCard report={report} onClose={() => setShowShareCard(false)} />}
    </article>
  );
}

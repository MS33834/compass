// 指南 · 人物详情 · 卷轴

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useStore } from '../store';
import { findFigureById } from '../domain/figures/figures.index';
import type { Figure } from '../domain/figures/figure.types';
import { Portrait } from './Portrait';
import { BrushButton } from './BrushButton';
import { OverlayPortal } from './OverlayPortal';
import { Verse } from './Verse';
import { pickLang } from '../domain/i18n';
import { useT } from '../i18n';

export function FigureDetail() {
  const viewingFigure = useStore(s => s.viewingFigure);
  const viewFigure = useStore(s => s.viewFigure);
  const selectDomain = useStore(s => s.selectDomain);
  const locale = useStore(s => s.locale);
  const closeFigure = () => viewFigure(null);
  const t = useT();
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [figure, setFigure] = useState<Figure | undefined>(undefined);
  const [related, setRelated] = useState<readonly Figure[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!viewingFigure) {
      setFigure(undefined);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    findFigureById(viewingFigure)
      .then(f => {
        if (cancelled) return;
        setFigure(f);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('Compass: failed to load figure detail', err);
        setFigure(undefined);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [viewingFigure]);

  useEffect(() => {
    if (!figure) {
      setRelated([]);
      return;
    }
    let cancelled = false;
    Promise.all(figure.echoes.map(id => findFigureById(id)))
      .then(found => {
        if (cancelled) return;
        setRelated(found.filter((f): f is Figure => Boolean(f)));
      })
      .catch(err => {
        if (cancelled) return;
        console.error('Compass: failed to load related figures', err);
        setRelated([]);
      });
    return () => {
      cancelled = true;
    };
  }, [figure]);

  // ESC 关闭 + 打开时禁止背景滚动
  useEffect(() => {
    if (!viewingFigure) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFigure();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [viewingFigure, closeFigure]);

  // 卷轴入场动画
  useEffect(() => {
    if (!figure || !overlayRef.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: 'power2.out' }
      );
      gsap.fromTo(
        '.cp-figure-scroll',
        { opacity: 0, x: 40, scale: 0.98 },
        { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: 'power3.out', delay: 0.1 }
      );
    }, overlayRef);

    return () => ctx.revert();
  }, [figure]);

  if (!viewingFigure) return null;

  if (loading || !figure) {
    return (
      <OverlayPortal>
        <div
          className="cp-figure-overlay"
          role="dialog"
          aria-modal="true"
          aria-live="polite"
          onClick={e => {
            if (e.target === overlayRef.current) closeFigure();
          }}
          ref={overlayRef}
        >
          <div className="cp-figure-scroll">
            <div className="cp-way-loading">{t.ui.loading}</div>
          </div>
        </div>
      </OverlayPortal>
    );
  }

  const handleStartDomain = () => {
    closeFigure();
    selectDomain(figure.domain);
  };

  const handleRelatedClick = (id: string) => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    viewFigure(id);
  };

  return (
    <OverlayPortal>
      <div
        ref={overlayRef}
        className="cp-figure-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="figure-detail-title"
        onClick={e => {
          if (e.target === overlayRef.current) closeFigure();
        }}
      >
        <div ref={scrollRef} className="cp-figure-scroll" tabIndex={-1}>
          <div className="cp-figure-content">
            <header className="cp-figure-header">
              <BrushButton
                variant="ghost"
                onClick={closeFigure}
                className="cp-figure-close"
                aria-label={t.figureDetail.close}
              >
                ← {t.figureDetail.close}
              </BrushButton>
            </header>

            <div className="cp-figure-grid">
              <div className="cp-figure-portrait">
                <Portrait figure={figure} />
                <div className="cp-figure-seal" aria-hidden>
                  {t.ui.sealChar}
                </div>
              </div>

              <div className="cp-figure-body">
                <p className="cp-figure-meta">
                  <span>{t.path.domains[figure.domain].name}</span>
                  <span aria-hidden> · </span>
                  <span>
                    {t.figureDetail.era}: {pickLang(figure.era, locale)}
                  </span>
                </p>

                <h1 id="figure-detail-title" className="cp-figure-name">
                  {pickLang(figure.name, locale)}
                </h1>

                <div className="cp-figure-quote">
                  <Verse text={pickLang(figure.signature, locale)} reveal />
                </div>

                <section className="cp-figure-section">
                  <h2>{t.figureDetail.bio}</h2>
                  <p className="cp-figure-bio">{pickLang(figure.bio, locale)}</p>
                </section>

                {figure.anecdotes.length > 0 && (
                  <section className="cp-figure-section">
                    <h2>{t.figureDetail.anecdotes}</h2>
                    <ul className="cp-figure-anecdotes">
                      {figure.anecdotes.map((a, i) => (
                        <li key={i}>
                          <strong>{pickLang(a.title, locale)}</strong>
                          <span>{pickLang(a.body, locale)}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {related.length > 0 && (
                  <section className="cp-figure-section">
                    <h2>{t.figureDetail.related}</h2>
                    <div className="cp-figure-related">
                      {related.map(f => (
                        <button
                          key={f.id}
                          type="button"
                          className="cp-figure-related-card"
                          aria-label={`${pickLang(f.name, locale)} · ${pickLang(f.era, locale)}`}
                          onClick={() => handleRelatedClick(f.id)}
                        >
                          <span className="cp-figure-related-name">{pickLang(f.name, locale)}</span>
                          <span className="cp-figure-related-era">{pickLang(f.era, locale)}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                <div className="cp-figure-actions">
                  <BrushButton variant="primary" onClick={handleStartDomain}>
                    {t.figureDetail.startQuiz}
                  </BrushButton>
                  <BrushButton variant="ghost" onClick={closeFigure}>
                    {t.figureDetail.close}
                  </BrushButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OverlayPortal>
  );
}

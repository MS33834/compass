// 镜心 · 映照 · 卷

import { useStore } from '../store';
import { TraitRadar } from '../components/TraitRadar';
import { Portrait } from '../components/Portrait';
import { BrushButton } from '../components/BrushButton';
import { Verse } from '../components/Verse';
import { TRAITS } from '../domain/traits/trait.dimensions';

export function Reflection() {
  const { report, goPhase, reset } = useStore();

  if (!report) {
    goPhase('prologue');
    return null;
  }

  const { primary, alternates, traitBreakdown, confidence } = report;
  const pct = Math.round(primary.score * 100);

  return (
    <article className="jx-container jx-scroll-reveal" aria-labelledby="ref-title">
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p
          style={{
            color: 'var(--ink-faint)',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.3em',
            marginBottom: '1rem',
          }}
        >
          镜 中 之 人
        </p>
        <h1 id="ref-title" style={{ marginBottom: '0.5rem' }}>
          {primary.figure.name}
        </h1>
        <p style={{ color: 'var(--ink-faint)' }}>
          {primary.figure.era} · 同道 {pct}%
        </p>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 2fr',
          gap: '2rem',
          marginBottom: '3rem',
        }}
        className="jx-ref-grid"
      >
        <div>
          <Portrait figure={primary.figure} />
        </div>
        <div>
          <Verse text={primary.figure.signature} gloss={primary.figure.bio} />
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem 1.25rem',
              background: 'var(--rice-warm)',
              borderLeft: '3px solid var(--cinnabar)',
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem',
              lineHeight: 1.8,
            }}
          >
            {primary.blurb}
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>同道</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
            gap: '1rem',
          }}
        >
          {alternates.map(a => (
            <article
              key={a.figure.id}
              style={{
                padding: '1rem',
                background: 'var(--rice-warm)',
                border: '1px solid var(--rice-deep)',
              }}
            >
              <h3 style={{ marginBottom: '0.5rem' }}>{a.figure.name}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-faint)', margin: 0 }}>
                {a.figure.era}
              </p>
              <p
                style={{
                  marginTop: '0.5rem',
                  fontFamily: 'var(--font-display)',
                  color: 'var(--jade)',
                  fontSize: '0.875rem',
                }}
              >
                {Math.round(a.score * 100)}%
              </p>
            </article>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>十二维</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)',
            gap: '2rem',
            alignItems: 'center',
          }}
          className="jx-ref-grid"
        >
          <TraitRadar
            user={report.traitBreakdown.map(b => b.user) as never}
            figure={primary.figure.vector}
          />
          <div>
            {traitBreakdown.map(b => {
              const trait = TRAITS.find(t => t.id === b.traitId);
              if (!trait) return null;
              return (
                <div
                  key={b.traitId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '4rem 1fr',
                    gap: '0.75rem',
                    padding: '0.5rem 0',
                    borderBottom: '1px dashed var(--rice-deep)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      color: 'var(--ink)',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {trait.name}
                  </span>
                  <span style={{ color: 'var(--ink-faint)', fontSize: '0.9rem' }}>
                    汝 {b.user.toFixed(2)} · 古人 {b.figure.toFixed(2)} ——
                    {b.comment.replace(/^.*?，/, '')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer
        style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid var(--rice-deep)',
        }}
      >
        <BrushButton variant="primary" onClick={() => goPhase('path')}>
          换一个域
        </BrushButton>
        <BrushButton onClick={reset}>再来一次</BrushButton>
      </footer>

      {confidence < 0.6 && (
        <p
          style={{
            textAlign: 'center',
            color: 'var(--ash)',
            fontSize: '0.875rem',
            marginTop: '1.5rem',
          }}
        >
          （汝所答尚少，此映照为略影；若欲更明，再答若干题即可。）
        </p>
      )}

      <style>{`
        @media (max-width: 640px) {
          .jx-ref-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </article>
  );
}

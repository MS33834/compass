// 镜心 · 选域 · 路

import { useState } from 'react';
import { useStore } from '../store';
import { BrushButton } from '../components/BrushButton';
import { Verse } from '../components/Verse';
import { figuresForDomain } from '../domain/figures/figures.index';
import type { DomainId } from '../domain/figures/figure.types';

type Region = 'east' | 'west';

const REGION_ZH: Record<Region, string> = { east: '东方', west: '西方' };

const DOMAINS_BY_REGION: Record<
  Region,
  { id: DomainId; name: string; sub: string; ready: boolean }[]
> = {
  east: [
    { id: 'east-literati', name: '文人墨客', sub: '诗人、词人、散文家、思想家', ready: true },
    { id: 'east-statesman', name: '治国能臣', sub: '宰相、将相、变法、孤忠', ready: false },
    { id: 'east-scientist', name: '科技先贤', sub: '天文、算学、医药、工学', ready: false },
  ],
  west: [
    { id: 'west-philosopher', name: '文哲巨擘', sub: '希腊、欧陆、英美思想家', ready: false },
    { id: 'west-scientist', name: '科学与思想', sub: '近代科学奠基人与思想者', ready: false },
  ],
};

export function Path() {
  const { selectDomain } = useStore();
  const [region, setRegion] = useState<Region>('east');
  const [picked, setPicked] = useState<DomainId | null>(null);

  const chosen = picked ? figuresForDomain(picked).length : 0;
  const ready = picked && chosen > 0;

  return (
    <section className="jx-container jx-fade-enter" aria-labelledby="path-title">
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 id="path-title">选域</h1>
        <p style={{ color: 'var(--ink-faint)' }}>汝欲入何方？</p>
      </header>

      <div
        role="tablist"
        style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}
      >
        {(Object.keys(REGION_ZH) as Region[]).map(r => (
          <button
            key={r}
            role="tab"
            aria-selected={region === r}
            onClick={() => {
              setRegion(r);
              setPicked(null);
            }}
            style={{
              padding: '0.5rem 1.5rem',
              background: region === r ? 'var(--ink)' : 'var(--rice-deep)',
              color: region === r ? 'var(--rice)' : 'var(--ink)',
              border: '1.5px solid var(--ink)',
              fontFamily: 'var(--font-display)',
              fontSize: '1.125rem',
              letterSpacing: '0.2em',
              cursor: 'pointer',
              transition: 'all 200ms',
            }}
          >
            {REGION_ZH[r]}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}
      >
        {DOMAINS_BY_REGION[region].map(d => {
          const count = figuresForDomain(d.id).length;
          const active = picked === d.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => d.ready && setPicked(d.id)}
              disabled={!d.ready}
              aria-pressed={active}
              style={{
                padding: '1.5rem 1.25rem',
                textAlign: 'left',
                background: active ? 'var(--rice-warm)' : 'transparent',
                border: `1.5px solid ${active ? 'var(--cinnabar)' : 'var(--rice-deep)'}`,
                cursor: d.ready ? 'pointer' : 'not-allowed',
                opacity: d.ready ? 1 : 0.45,
                transition: 'all 200ms',
                position: 'relative',
              }}
            >
              <h3 style={{ marginBottom: '0.5rem' }}>{d.name}</h3>
              <p style={{ color: 'var(--ink-faint)', fontSize: '0.875rem', margin: 0 }}>{d.sub}</p>
              <p
                style={{
                  marginTop: '0.75rem',
                  fontFamily: 'var(--font-display)',
                  color: d.ready ? 'var(--jade)' : 'var(--ash)',
                  fontSize: '0.875rem',
                }}
              >
                {d.ready ? `${count} 人` : '待补'}
              </p>
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="jx-fade-enter" style={{ textAlign: 'center' }}>
          <Verse
            text={`${REGION_ZH[region]} · ${DOMAINS_BY_REGION[region].find(d => d.id === picked)?.name}`}
            gloss="既已择定，便入其问。"
          />
          <div style={{ marginTop: '2rem' }}>
            <BrushButton
              variant="primary"
              disabled={!ready}
              onClick={() => ready && selectDomain(picked)}
            >
              开始
            </BrushButton>
          </div>
        </div>
      )}
    </section>
  );
}

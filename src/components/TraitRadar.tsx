// 指南 · 12 维雷达图

import { useState } from 'react';
import { TRAITS } from '../domain/traits/trait.dimensions';
import type { TraitVector } from '../domain/traits/trait.types';
import { useT } from '../i18n';

type Props = {
  user: TraitVector;
  figure?: TraitVector;
  size?: number;
  ariaLabel?: string;
};

export function TraitRadar({ user, figure, size = 400, ariaLabel }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const N = 12;
  const t = useT();
  const youLabel = t.reflection.chartLabels.you;
  const ancientLabel = t.reflection.chartLabels.ancient;

  // 各维角
  const angles = Array.from({ length: N }, (_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / N);

  // 用户点
  const userPoints = user.map((v, i) => {
    const a = angles[i];
    return [cx + r * v * Math.cos(a), cy + r * v * Math.sin(a)] as const;
  });

  // 古人点
  const figPoints = figure?.map((v, i) => {
    const a = angles[i];
    return [cx + r * v * Math.cos(a), cy + r * v * Math.sin(a)] as const;
  });

  // 用于 SVG polygon 的 points 字符串
  const pointsToStr = (pts: readonly (readonly [number, number])[]) =>
    pts.map(p => p.join(',')).join(' ');

  // 悬停高亮
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // 刻度圆环
  const gridRings = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="cp-radar"
      data-testid="trait-radar"
      role="img"
      aria-label={ariaLabel}
      style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
    >
      {/* 装饰性宣纸背景 */}
      <defs>
        <radialGradient id="paperGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--rice-warm)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="userFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--ink)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--ink)" stopOpacity="0.02" />
        </radialGradient>
        <radialGradient id="figFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--cinnabar)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--cinnabar)" stopOpacity="0.02" />
        </radialGradient>
      </defs>

      {/* 宣纸晕染背景 */}
      <circle cx={cx} cy={cy} r={r * 1.08} fill="url(#paperGlow)" />

      {/* 刻度圆环 */}
      {gridRings.map((g, i) => (
        <circle
          key={`g${i}`}
          cx={cx}
          cy={cy}
          r={r * g}
          fill="none"
          stroke="var(--ink)"
          strokeOpacity={hoverIdx !== null ? 0.04 : 0.1}
          strokeDasharray="2 4"
          style={{ transition: 'stroke-opacity 300ms ease' }}
        />
      ))}

      {/* 辐射线 */}
      {angles.map((a, i) => (
        <line
          key={`l${i}`}
          x1={cx}
          y1={cy}
          x2={cx + r * Math.cos(a)}
          y2={cy + r * Math.sin(a)}
          stroke="var(--ink)"
          strokeOpacity={hoverIdx === i ? 0.3 : 0.12}
          strokeWidth={hoverIdx === i ? 1.5 : 1}
          style={{ transition: 'all 200ms ease' }}
        />
      ))}

      {/* 古人多边形 */}
      {figPoints && (
        <>
          <polygon
            points={pointsToStr(figPoints)}
            fill="url(#figFill)"
            stroke="var(--cinnabar)"
            strokeOpacity={0.7}
            strokeWidth={1.3}
            strokeLinejoin="round"
            style={{
              opacity: 0,
              animation: 'cp-radar-fade-in 1200ms ease 400ms forwards',
            }}
          />
          {/* 古人逐点 */}
          {figPoints.map((p, i) => (
            <circle
              key={`fp${i}`}
              cx={p[0]}
              cy={p[1]}
              r={hoverIdx === i ? 5 : 3.5}
              fill="var(--cinnabar)"
              stroke="var(--rice)"
              strokeWidth={1}
              style={{
                transition: 'all 200ms ease',
                opacity: 0,
                animation: 'cp-radar-fade-in 1200ms ease 800ms forwards',
              }}
            />
          ))}
        </>
      )}

      {/* 用户多边形 —— 带笔触动画 */}
      <polygon
        points={pointsToStr(userPoints)}
        fill="url(#userFill)"
        stroke="var(--ink)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{
          strokeDasharray: 2000,
          strokeDashoffset: 2000,
          animation:
            'cp-radar-draw 1600ms cubic-bezier(0.2, 0.9, 0.3, 1) 200ms forwards, cp-radar-glow 4000ms ease-in-out 1800ms infinite',
        }}
      />

      {/* 用户逐点（可交互） */}
      {userPoints.map((p, i) => {
        const traitName = TRAITS[i]?.name ?? `#${i + 1}`;
        const titleText = figure
          ? `${traitName} · ${youLabel} ${Math.round(user[i] * 100)} · ${ancientLabel} ${Math.round(figure[i] * 100)}`
          : `${traitName} · ${youLabel} ${Math.round(user[i] * 100)}`;
        return (
          <g key={`up${i}`}>
            <title>{titleText}</title>
            {/* 点击热区 */}
            <circle
              cx={cx + r * Math.cos(angles[i])}
              cy={cy + r * Math.sin(angles[i])}
              r={20}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              onTouchStart={() => setHoverIdx(i)}
              onTouchEnd={() => setHoverIdx(null)}
            />
            <circle
              cx={p[0]}
              cy={p[1]}
              r={hoverIdx === i ? 6 : 4}
              fill="var(--ink)"
              stroke="var(--rice)"
              strokeWidth={1.5}
              style={{
                transition: 'all 200ms ease',
                filter: hoverIdx === i ? 'drop-shadow(0 0 4px var(--ink))' : 'none',
              }}
            />
            {/* 悬停时画出差异指示线 */}
            {hoverIdx === i && figure && figPoints && figPoints[i] && (
              <line
                x1={p[0]}
                y1={p[1]}
                x2={figPoints[i][0]}
                y2={figPoints[i][1]}
                stroke="var(--cinnabar)"
                strokeOpacity={0.5}
                strokeDasharray="3 3"
                strokeWidth={1.5}
              />
            )}
          </g>
        );
      })}

      {/* 维度标签 */}
      {angles.map((a, i) => {
        const labelX = cx + (r + 22) * Math.cos(a);
        const labelY = cy + (r + 22) * Math.sin(a);
        const glyph = TRAITS[i].glyph;
        const hovered = hoverIdx === i;

        return (
          <g key={`t${i}`} style={{ pointerEvents: 'none' }}>
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={size * 0.05}
              fill={hovered ? 'var(--cinnabar)' : 'var(--ink)'}
              fontFamily="var(--font-display)"
              fontWeight={hovered ? 700 : 500}
              style={{ transition: 'all 200ms ease' }}
            >
              {glyph}
            </text>
            {/* 悬停值显示 */}
            {hovered && (
              <>
                <text
                  x={labelX}
                  y={labelY + size * 0.06}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={size * 0.032}
                  fill="var(--ink)"
                  fontFamily="var(--font-body)"
                >
                  {youLabel} {Math.round(user[i] * 100)}
                </text>
                {figure && (
                  <text
                    x={labelX}
                    y={labelY + size * 0.1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={size * 0.03}
                    fill="var(--cinnabar)"
                    fontFamily="var(--font-body)"
                  >
                    {ancientLabel} {Math.round(figure[i] * 100)}
                  </text>
                )}
              </>
            )}
          </g>
        );
      })}

      {/* 动画样式定义 */}
      <style>{`
        @keyframes cp-radar-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes cp-radar-fade-in {
          to { opacity: 1; }
        }
        @keyframes cp-radar-glow {
          0%, 100% { stroke-width: 2; }
          50% { stroke-width: 2.4; }
        }
      `}</style>
    </svg>
  );
}

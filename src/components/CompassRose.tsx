interface CompassRoseProps {
  /** 控制大小 / 旋转动画等样式（通过 className 传入） */
  className?: string;
}

// 极坐标 → 笛卡尔坐标（0° 朝上，顺时针递增）
const polar = (r: number, angleDeg: number) => {
  const a = (angleDeg * Math.PI) / 180;
  return { x: 50 + r * Math.sin(a), y: 50 - r * Math.cos(a) };
};

const R_CARD = 38; // 主方位指针长度（N/E/S/W）
const R_INTER = 26; // 次方位指针长度（NE/SE/SW/NW）
const R_ROOT = 10; // 指针根部半径

type Dir = { label: string; angle: number; cardinal: boolean };

// 八方位
const DIRECTIONS: Dir[] = [
  { label: 'N', angle: 0, cardinal: true },
  { label: 'NE', angle: 45, cardinal: false },
  { label: 'E', angle: 90, cardinal: true },
  { label: 'SE', angle: 135, cardinal: false },
  { label: 'S', angle: 180, cardinal: true },
  { label: 'SW', angle: 225, cardinal: false },
  { label: 'W', angle: 270, cardinal: true },
  { label: 'NW', angle: 315, cardinal: false },
];

// 每个指针拆为「左亮 / 右暗」两片三角形，模拟罗盘立体光影
const KITES = DIRECTIONS.map((d) => {
  const rOut = d.cardinal ? R_CARD : R_INTER;
  const tip = polar(rOut, d.angle);
  const right = polar(R_ROOT, d.angle + 22.5);
  const left = polar(R_ROOT, d.angle - 22.5);
  return {
    label: d.label,
    cardinal: d.cardinal,
    isNorth: d.label === 'N',
    light: `${tip.x},${tip.y} ${left.x},${left.y} 50,50`,
    dark: `${tip.x},${tip.y} ${right.x},${right.y} 50,50`,
  };
});

// 方位字母位置
const LABELS = DIRECTIONS.map((d) => ({
  label: d.label,
  cardinal: d.cardinal,
  isNorth: d.label === 'N',
  pos: polar(49, d.angle),
}));

// 外圈刻度：每 5° 一根，每 45°（主方位）加粗
const TICKS = Array.from({ length: 72 }, (_, i) => {
  const angle = i * 5;
  const major = i % 9 === 0;
  const p1 = polar(major ? 41 : 43, angle);
  const p2 = polar(46, angle);
  return { key: i, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, major };
});

/**
 * 航海罗盘玫瑰装饰组件（纯 SVG）。
 * N 方位以 brass 高亮，其余主方位 ivory、次方位 starlight。
 * 通过 className 控制尺寸与动画（如 animate-spin-slow）。
 */
export function CompassRose({ className }: CompassRoseProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* 外圈双环 */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.35" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.25" opacity="0.2" />

      {/* 刻度 */}
      {TICKS.map((t) => (
        <line
          key={t.key}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke="currentColor"
          strokeWidth={t.major ? 0.5 : 0.2}
          opacity={t.major ? 0.5 : 0.25}
        />
      ))}

      {/* 八方位指针 */}
      {KITES.map((k) => {
        // N 指针 brass 高亮；其余主方位 ivory；次方位 starlight
        const baseFill = k.isNorth ? '#C9A227' : k.cardinal ? '#F5F1E8' : '#A8B4C4';
        const darkFill = k.isNorth ? '#a3851c' : baseFill;
        const lightOp = k.isNorth ? 0.95 : k.cardinal ? 0.3 : 0.22;
        const darkOp = k.isNorth ? 0.95 : k.cardinal ? 0.16 : 0.11;
        return (
          <g key={k.label}>
            <polygon points={k.light} fill={baseFill} fillOpacity={lightOp} />
            <polygon points={k.dark} fill={darkFill} fillOpacity={darkOp} />
          </g>
        );
      })}

      {/* 中心装饰：底圆遮盖指针交汇 + 四角星 + 中心点 */}
      <circle cx="50" cy="50" r="6.5" fill="#0B1426" stroke="#C9A227" strokeWidth="0.6" opacity="0.95" />
      <polygon points="50,44 52,50 50,56 48,50" fill="#C9A227" opacity="0.95" />
      <polygon points="44,50 50,48 56,50 50,52" fill="#C9A227" opacity="0.5" />
      <circle cx="50" cy="50" r="1.1" fill="#F5F1E8" />

      {/* 方位字母 */}
      {LABELS.map((l) => (
        <text
          key={l.label}
          x={l.pos.x}
          y={l.pos.y}
          fontSize={l.isNorth ? 7 : l.cardinal ? 6 : 3.5}
          fontWeight={l.cardinal ? 700 : 500}
          fill={l.isNorth ? '#C9A227' : l.cardinal ? '#F5F1E8' : '#A8B4C4'}
          opacity={l.cardinal ? 0.85 : 0.5}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-sans), system-ui, sans-serif"
        >
          {l.label}
        </text>
      ))}
    </svg>
  );
}

export default CompassRose;

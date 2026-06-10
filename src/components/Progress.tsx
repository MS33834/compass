// 镜心 · 进度条

type Props = { value: number; total: number };

export function Progress({ value, total }: Props) {
  const pct = total === 0 ? 0 : Math.min(100, (value / total) * 100);
  return (
    <div
      className="jx-progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      <div className="jx-progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

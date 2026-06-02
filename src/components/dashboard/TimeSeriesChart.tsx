import { AssessmentTrend } from '../../types/dataAbstraction';

interface TimeSeriesChartProps {
  trend: AssessmentTrend;
  width?: number;
  height?: number;
}

export function TimeSeriesChart({ trend, width = 600, height = 300 }: TimeSeriesChartProps) {
  const { dataPoints, traitName, trend: trendDirection, change, changePercent } = trend;

  const padding = 50;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const scores = dataPoints.map(d => d.score);
  const maxScore = Math.max(...scores, 100);
  const minScore = Math.min(...scores, 0);
  const scoreRange = maxScore - minScore || 1;

  const points = dataPoints.map((point, index) => {
    const x = padding + (index / (dataPoints.length - 1 || 1)) * chartWidth;
    const y = padding + chartHeight - ((point.score - minScore) / scoreRange) * chartHeight;
    return { x, y, ...point };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1]?.x || 0} ${padding + chartHeight} L ${points[0]?.x || 0} ${padding + chartHeight} Z`;

  const trendColor = trendDirection === 'increasing' ? 'text-green-600' : trendDirection === 'decreasing' ? 'text-red-600' : 'text-gray-600';
  const trendBg = trendDirection === 'increasing' ? 'bg-green-100' : trendDirection === 'decreasing' ? 'bg-red-100' : 'bg-gray-100';
  const trendIcon = trendDirection === 'increasing' ? '📈' : trendDirection === 'decreasing' ? '📉' : '➡️';

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">{traitName}趋势</h3>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${trendBg}`}>
          <span className="text-xl">{trendIcon}</span>
          <span className={`text-sm font-medium ${trendColor}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(1)} ({changePercent.toFixed(1)}%)
          </span>
        </div>
      </div>

      <svg width={width} height={height} className="mx-auto">
        <defs>
          <linearGradient id={`gradient-${traitName}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <line x1={padding} y1={padding} x2={padding} y2={padding + chartHeight} stroke="#E5E7EB" strokeWidth="1" />
        <line x1={padding} y1={padding + chartHeight} x2={width - padding} y2={padding + chartHeight} stroke="#E5E7EB" strokeWidth="1" />

        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + chartHeight - ratio * chartHeight;
          const value = minScore + ratio * scoreRange;
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#F3F4F6" strokeWidth="1" strokeDasharray="4" />
              <text x={padding - 10} y={y + 4} textAnchor="end" className="text-xs fill-slate-500">
                {Math.round(value)}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill={`url(#gradient-${traitName})`} />

        <path d={linePath} fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill="#3B82F6"
              stroke="white"
              strokeWidth="2"
              className="hover:r-8 transition-all cursor-pointer"
            />
            <title>
              {`${new Date(point.timestamp).toLocaleDateString()}: ${point.score}分`}
            </title>
          </g>
        ))}

        {dataPoints.map((point, index) => {
          const x = padding + (index / (dataPoints.length - 1 || 1)) * chartWidth;
          return (
            <text
              key={index}
              x={x}
              y={height - 10}
              textAnchor="middle"
              className="text-xs fill-slate-500"
            >
              {new Date(point.timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
            </text>
          );
        })}
      </svg>

      <div className="mt-4 text-center text-sm text-slate-600">
        共{dataPoints.length}次测评 | 
        时间范围：{new Date(dataPoints[0]?.timestamp || 0).toLocaleDateString()} - {new Date(dataPoints[dataPoints.length - 1]?.timestamp || 0).toLocaleDateString()}
      </div>
    </div>
  );
}

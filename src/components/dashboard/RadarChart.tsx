import { UnifiedAssessmentResult } from '../../types/dataAbstraction';

interface RadarChartProps {
  results: UnifiedAssessmentResult[];
  width?: number;
  height?: number;
}

export function RadarChart({ results, width = 500, height = 500 }: RadarChartProps) {
  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md flex items-center justify-center h-96">
        <p className="text-slate-500">暂无数据</p>
      </div>
    );
  }

  const latestResult = results[0];
  const traits = latestResult.traits;

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 60;

  const angleStep = (2 * Math.PI) / traits.length;
  const startAngle = -Math.PI / 2;

  const levels = [0.25, 0.5, 0.75, 1];

  const getPointCoordinates = (value: number, index: number, r: number) => {
    const angle = startAngle + index * angleStep;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle)
    };
  };

  const gridPoints = levels.map(level => {
    return traits.map((_, index) => {
      const point = getPointCoordinates(level, index, radius);
      return `${point.x},${point.y}`;
    }).join(' ');
  });

  const dataPoints = traits.map((trait, index) => {
    const normalizedValue = Math.min(trait.score / 100, 1);
    return getPointCoordinates(normalizedValue, index, radius);
  });

  const dataPath = dataPoints.map((point, index) => {
    return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
  }).join(' ') + ' Z';
  void dataPath;

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">
        特质雷达图
        <span className="block text-sm font-normal text-slate-500 mt-1">
          {new Date(latestResult.timestamp).toLocaleDateString('zh-CN')}
        </span>
      </h3>

      <svg width={width} height={height} className="mx-auto">
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {gridPoints.map((points, levelIndex) => (
          <polygon
            key={levelIndex}
            points={points}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        ))}

        {traits.map((_, index) => {
          const endPoint = getPointCoordinates(1, index, radius);
          return (
            <line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          );
        })}

        <polygon
          points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')}
          fill="url(#radarGradient)"
          stroke="#8B5CF6"
          strokeWidth="2"
        />

        {dataPoints.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill="#8B5CF6"
              stroke="white"
              strokeWidth="2"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill="white"
            />
          </g>
        ))}

        {traits.map((trait, index) => {
          const labelPoint = getPointCoordinates(1.15, index, radius);
          return (
            <text
              key={index}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-medium fill-slate-700"
            >
              {trait.name}
            </text>
          );
        })}

        {traits.map((trait, index) => {
          const labelPoint = getPointCoordinates(1.25, index, radius);
          return (
            <text
              key={`score-${index}`}
              x={labelPoint.x}
              y={labelPoint.y + 12}
              textAnchor="middle"
              className="text-xs fill-slate-500"
            >
              {trait.score}分
            </text>
          );
        })}
      </svg>

      <div className="mt-4 text-center text-sm text-slate-600">
        {results.length > 1 && (
          <span className="text-blue-600">
            对比 {results.length} 次测评结果
          </span>
        )}
      </div>
    </div>
  );
}

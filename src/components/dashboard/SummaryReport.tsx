import { useState } from 'react';
import { PeriodicSummary } from '../../types/dataAbstraction';
import { reportGenerator } from '../../services/dashboard/ReportGenerator';

interface SummaryReportProps {
  summary: PeriodicSummary;
}

export function SummaryReport({ summary }: SummaryReportProps) {
  const [reportText, setReportText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);

  const periodNames = {
    weekly: '周',
    monthly: '月',
    quarterly: '季度',
    yearly: '年'
  };

  const trendIcons = {
    up: '📈',
    down: '📉',
    stable: '➡️'
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const report = await reportGenerator.generatePeriodicReport(summary);
      setReportText(report);
      setShowFullReport(true);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${periodNames[summary.period]}度报告_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">
          📊 {periodNames[summary.period]}度总结报告
        </h3>
        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? '生成中...' : '生成详细报告'}
        </button>
      </div>

      <div className="space-y-4 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">统计周期：</span>
          <span className="font-medium text-slate-800">
            {new Date(summary.startDate).toLocaleDateString()} - {new Date(summary.endDate).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">测评次数：</span>
          <span className="font-medium text-slate-800">{summary.assessments.length}次</span>
        </div>

        {summary.overallScore !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">平均得分：</span>
            <span className="font-medium text-blue-600">{summary.overallScore.toFixed(1)}分</span>
          </div>
        )}
      </div>

      {Object.keys(summary.trends.traits).length > 0 && (
        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-semibold text-slate-800 mb-3">📈 趋势概览</h4>
          <div className="space-y-2">
            {Object.entries(summary.trends.traits).map(([trait, trend]) => (
              <div key={trait} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{trait}</span>
                <div className="flex items-center space-x-2">
                  <span>{trendIcons[trend.direction]}</span>
                  <span className="text-slate-600">
                    {trend.direction === 'up' ? '+' : ''}{trend.change.toFixed(1)}分
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary.insights.length > 0 && (
        <div className="border-t border-slate-200 pt-4 mt-4">
          <h4 className="font-semibold text-slate-800 mb-3">💡 关键洞察</h4>
          <div className="space-y-2">
            {summary.insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <span className="text-blue-600 mt-0.5">•</span>
                <span className="text-slate-700">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary.recommendations.length > 0 && (
        <div className="border-t border-slate-200 pt-4 mt-4">
          <h4 className="font-semibold text-slate-800 mb-3">🎯 行动建议</h4>
          <div className="space-y-2">
            {summary.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <span className="text-green-600 mt-0.5">{index + 1}.</span>
                <span className="text-slate-700">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showFullReport && reportText && (
        <div className="border-t border-slate-200 pt-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-800">📄 完整报告</h4>
            <button
              onClick={handleDownload}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
            >
              下载 Markdown
            </button>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
              {reportText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

import { useMemo } from 'react';
import { useAppStore } from '../store';
import { traceService } from '../services/trace/TraceService';
import type { TraceLogEntry } from '../services/trace/TraceService';

const ACTION_LABELS: Record<string, { en: string; zh: string }> = {
  'answer_selected': { en: 'Answer Selected', zh: '选择答案' },
  'answer_changed': { en: 'Answer Changed', zh: '修改答案' },
  'question_skipped': { en: 'Question Skipped', zh: '跳过题目' },
  'score_calculated': { en: 'Score Calculated', zh: '计算分数' },
  'score_transformed': { en: 'Score Transformed', zh: '分数转换' },
  'trait_aggregated': { en: 'Trait Aggregated', zh: '特质聚合' },
  'report_generated': { en: 'Report Generated', zh: '生成报告' },
  'tag_applied': { en: 'Tag Applied', zh: '添加标签' },
  'result_stored': { en: 'Result Stored', zh: '保存结果' },
};

const ACTION_COLORS: Record<string, string> = {
  'answer_selected': 'bg-blue-100 text-blue-700',
  'answer_changed': 'bg-yellow-100 text-yellow-700',
  'question_skipped': 'bg-gray-100 text-gray-700',
  'score_calculated': 'bg-green-100 text-green-700',
  'score_transformed': 'bg-purple-100 text-purple-700',
  'trait_aggregated': 'bg-pink-100 text-pink-700',
  'report_generated': 'bg-indigo-100 text-indigo-700',
  'tag_applied': 'bg-orange-100 text-orange-700',
  'result_stored': 'bg-teal-100 text-teal-700'
};

interface TracePanelProps {
  assessmentId: string;
  onClose: () => void;
}

export function TracePanel({ assessmentId, onClose }: TracePanelProps) {
  const locale = useAppStore((state) => state.locale);
  const t = (zh: string, en: string) => (locale === 'zh' ? zh : en);

  const traces = useMemo<TraceLogEntry[]>(
    () => traceService.getTraceForAssessment(assessmentId),
    [assessmentId],
  );
  const verification = useMemo(
    () => traceService.verifyIntegrity(assessmentId),
    [assessmentId],
  );

  const exportReport = () => {
    const report = traceService.exportTraceReport(assessmentId);
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trace-report-${assessmentId}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionLabel = (action: string) => {
    const entry = ACTION_LABELS[action];
    if (entry) return locale === 'zh' ? entry.zh : entry.en;
    return action;
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('测评溯源面板', 'Assessment Trace Panel')}
    >
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              🔍 {t('测评溯源面板', 'Assessment Trace Panel')}
            </h2>
            <p className="text-sm text-slate-500 break-all">
              {t('测评 ID', 'Assessment ID')}: {assessmentId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            aria-label={t('关闭', 'Close')}
          >
            ✕
          </button>
        </div>

        <div className={`p-6 border-b ${
          verification.valid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">{verification.valid ? '✅' : '⚠️'}</span>
            <div>
              <h3 className="font-semibold text-slate-800">
                {t('完整性检查', 'Integrity Check')}: {verification.valid ? t('通过', 'Passed') : t('发现问题', 'Issues Found')}
              </h3>
              {verification.issues.length > 0 && (
                <ul className="text-sm text-slate-600 mt-1">
                  {verification.issues.map((issue, idx) => (
                    <li key={idx}>• {issue}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 overflow-auto max-h-[50vh]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">{t('操作记录', 'Activity Log')}</h3>
            <span className="text-sm text-slate-500">
              {traces.length} {t('条记录', 'entries')}
            </span>
          </div>

          {traces.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <div className="text-4xl mb-2" aria-hidden="true">📭</div>
              <p>{t('暂无溯源记录', 'No trace records')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {traces.map((trace) => (
                <div
                  key={trace.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ACTION_COLORS[trace.action] || 'bg-gray-100 text-gray-700'
                      }`}>
                        {getActionLabel(trace.action)}
                      </span>
                      {trace.questionId && (
                        <span className="text-sm text-slate-500">
                          {t('题目', 'Question')} {trace.questionId}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(trace.timestamp).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                      {JSON.stringify(trace.details, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-slate-200">
          <div className="text-sm text-slate-500 break-all">
            {t('会话', 'Session')}: {traces[0]?.sessionId || 'N/A'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportReport}
              disabled={traces.length === 0}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {t('导出报告', 'Export Report')}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              {t('关闭', 'Close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

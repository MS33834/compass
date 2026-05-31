import { useState } from 'react';
import { traceService } from '../services/trace/TraceService';
import type { TraceLogEntry } from '../services/trace/TraceService';

const ACTION_LABELS: Record<string, string> = {
  'answer_selected': '选择答案',
  'answer_changed': '修改答案',
  'question_skipped': '跳过题目',
  'score_calculated': '计算分数',
  'score_transformed': '分数转换',
  'trait_aggregated': '特质聚合',
  'report_generated': '生成报告',
  'tag_applied': '添加标签',
  'result_stored': '保存结果'
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
  const [traces, setTraces] = useState<TraceLogEntry[]>(() => 
    traceService.getTraceForAssessment(assessmentId)
  );
  const [verification, setVerification] = useState(() => 
    traceService.verifyIntegrity(assessmentId)
  );

  const exportReport = () => {
    const report = traceService.exportTraceReport(assessmentId);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trace-report-${assessmentId}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">测评溯源面板</h2>
            <p className="text-sm text-slate-500">测评 ID: {assessmentId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 完整性检查 */}
        <div className={`p-6 border-b ${
          verification.valid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{verification.valid ? '✅' : '⚠️'}</span>
            <div>
              <h3 className="font-semibold text-slate-800">
                完整性检查: {verification.valid ? '通过' : '发现问题'}
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

        {/* 操作记录 */}
        <div className="p-6 overflow-auto max-h-[50vh]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">操作记录</h3>
            <span className="text-sm text-slate-500">{traces.length} 条记录</span>
          </div>

          {traces.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <div className="text-4xl mb-2">📭</div>
              <p>暂无溯源记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {traces.map((trace, idx) => (
                <div
                  key={trace.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ACTION_COLORS[trace.action] || 'bg-gray-100 text-gray-700'
                      }`}>
                        {ACTION_LABELS[trace.action] || trace.action}
                      </span>
                      {trace.questionId && (
                        <span className="text-sm text-slate-500">
                          题目 {trace.questionId}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(trace.timestamp).toLocaleString('zh-CN')}
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

        {/* 底部操作 */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200">
          <div className="text-sm text-slate-500">
            会话: {traces[0]?.sessionId || 'N/A'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportReport}
              disabled={traces.length === 0}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              导出报告
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

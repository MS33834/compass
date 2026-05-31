import { storage } from '../../lib/utils';

const TRACE_LOGS_KEY = 'assessment_trace_logs';

export type TraceAction =
  | 'answer_selected'
  | 'answer_changed'
  | 'question_skipped'
  | 'score_calculated'
  | 'score_transformed'
  | 'trait_aggregated'
  | 'report_generated'
  | 'tag_applied'
  | 'result_stored';

export interface TraceLogEntry {
  id: string;
  timestamp: number;
  action: TraceAction;
  assessmentId: string;
  questionId?: string;
  userId: string;
  sessionId: string;
  details: any;
}

export class TraceService {
  private logs: TraceLogEntry[] = [];
  private sessionId: string = `session_${Date.now()}`;
  private userId: string = 'default';

  constructor() {
    this.loadLogs();
  }

  log(
    action: TraceAction,
    assessmentId: string,
    details: any,
    questionId?: string
  ): void {
    const entry: TraceLogEntry = {
      id: `trace_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      action,
      assessmentId,
      questionId,
      userId: this.userId,
      sessionId: this.sessionId,
      details
    };

    this.logs.push(entry);
    this.saveLogs();
  }

  getTraceForAssessment(assessmentId: string): TraceLogEntry[] {
    return this.logs
      .filter(log => log.assessmentId === assessmentId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  getTraceForSession(sessionId: string): TraceLogEntry[] {
    return this.logs
      .filter(log => log.sessionId === sessionId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  getAllTraces(): TraceLogEntry[] {
    return [...this.logs].sort((a, b) => b.timestamp - a.timestamp);
  }

  verifyIntegrity(assessmentId: string): {
    valid: boolean;
    issues: string[];
    checkedAt: number;
  } {
    const traces = this.getTraceForAssessment(assessmentId);
    const issues: string[] = [];

    const answerActions = traces.filter(t =>
      t.action === 'answer_selected' || t.action === 'answer_changed'
    );

    const calcActions = traces.filter(t => t.action === 'score_calculated');

    if (answerActions.length === 0) {
      issues.push('没有找到答题记录');
    }

    if (calcActions.length === 0) {
      issues.push('没有找到分数计算记录');
    }

    const hasReport = traces.some(t => t.action === 'report_generated');
    if (!hasReport) {
      issues.push('没有找到报告生成记录');
    }

    return {
      valid: issues.length === 0,
      issues,
      checkedAt: Date.now()
    };
  }

  clearOldTraces(olderThanDays: number = 30): number {
    const cutoffDate = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    const oldLength = this.logs.length;
    
    this.logs = this.logs.filter(log => log.timestamp >= cutoffDate);
    this.saveLogs();
    
    return oldLength - this.logs.length;
  }

  exportTraceReport(assessmentId: string): string {
    const traces = this.getTraceForAssessment(assessmentId);
    const integrity = this.verifyIntegrity(assessmentId);

    const report = [
      `# 测评溯源报告`,
      ``,
      `**测评 ID**: ${assessmentId}`,
      `**生成时间**: ${new Date().toLocaleString('zh-CN')}`,
      ``,
      `## 完整性检查`,
      ``,
      `**状态**: ${integrity.valid ? '✅ 通过' : '❌ 警告'}`,
      ``,
      integrity.issues.length > 0 ? `**问题**:\n${integrity.issues.map(i => `- ${i}`).join('\n')}\n` : '',
      `## 操作记录`,
      ``,
      `| 时间 | 操作 | 题目 | 详情 |`,
      `|------|------|------|------|`,
      ...traces.map(trace => `| ${new Date(trace.timestamp).toLocaleString('zh-CN')} | ${trace.action} | ${trace.questionId || '-'} | ${JSON.stringify(trace.details).substring(0, 50)}... |`),
      ``,
      `---`,
      `共 ${traces.length} 条记录`
    ].join('\n');

    return report;
  }

  getStatistics(): {
    totalTraces: number;
    todayTraces: number;
    thisWeekTraces: number;
    assessmentsTracked: number;
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const todayTraces = this.logs.filter(l => l.timestamp >= today.getTime());
    const weekTraces = this.logs.filter(l => l.timestamp >= weekAgo.getTime());
    const uniqueAssessments = new Set(this.logs.map(l => l.assessmentId));

    return {
      totalTraces: this.logs.length,
      todayTraces: todayTraces.length,
      thisWeekTraces: weekTraces.length,
      assessmentsTracked: uniqueAssessments.size
    };
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  private loadLogs(): void {
    try {
      this.logs = storage.get<TraceLogEntry[]>(TRACE_LOGS_KEY, []);
    } catch (error) {
      console.error('Failed to load trace logs:', error);
      this.logs = [];
    }
  }

  private saveLogs(): void {
    try {
      storage.set(TRACE_LOGS_KEY, this.logs);
    } catch (error) {
      console.error('Failed to save trace logs:', error);
    }
  }
}

export const traceService = new TraceService();

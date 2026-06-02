import {
  UnifiedAssessmentResult,
  DataStatistics,
  AssessmentTrend,
  PeriodicSummary,
} from '../../types/dataAbstraction';
import { dataAggregationService } from '../dataAbstraction/DataAggregationService';
import { dataSyncService } from '../dataAbstraction/DataSyncService';
import { tagService } from './TagService';

class DashboardService {
  async initializeDashboard(_userId: string): Promise<any> {
    await dataSyncService.syncAllAssessments();

    const personalCenter = dataSyncService.getPersonalDataCenter();
    const results = personalCenter.results;

    const statistics = dataAggregationService.calculateStatistics(results);

    const recentResults = this.getRecentResults(results, 10);

    const trends = this.calculateKeyTrends(results);

    const summaries = this.generateRecentSummaries();

    const topTags = tagService.getTopTags(10);

    const insights = this.getInsights();

    return {
      statistics,
      recentResults,
      trends,
      summaries,
      topTags,
      insights,
    };
  }

  private getRecentResults(
    results: UnifiedAssessmentResult[],
    limit: number
  ): UnifiedAssessmentResult[] {
    return [...results].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  private calculateKeyTrends(results: UnifiedAssessmentResult[]): AssessmentTrend[] {
    const trends: AssessmentTrend[] = [];

    if (results.length < 2) return trends;

    const personalityResults = results.filter(r => r.assessmentType === 'personality');
    const stressResults = results.filter(r => r.assessmentType === 'stress');
    const anxietyResults = results.filter(r => r.assessmentType === 'anxiety');
    void personalityResults;
    void stressResults;
    void anxietyResults;

    const keyTraits = [
      '开放性',
      '尽责性',
      '外向性',
      '宜人性',
      '情绪稳定性',
      '压力水平',
      '焦虑水平',
    ];

    keyTraits.forEach(traitName => {
      const traitResults = results.filter(r => r.traits.some(t => t.name === traitName));

      if (traitResults.length >= 2) {
        const trend = dataAggregationService.calculateTraitTrend(traitResults, traitName);
        if (trend) {
          trends.push(trend);
        }
      }
    });

    return trends;
  }

  private generateRecentSummaries(): PeriodicSummary[] {
    const summaries: PeriodicSummary[] = [];

    const weekly = dataAggregationService.generatePeriodicSummary('weekly');
    if (weekly) summaries.push(weekly);

    const monthly = dataAggregationService.generatePeriodicSummary('monthly');
    if (monthly) summaries.push(monthly);

    return summaries;
  }

  getDashboardDataByDateRange(
    startDate: number,
    endDate: number
  ): {
    results: UnifiedAssessmentResult[];
    statistics: DataStatistics;
    trends: AssessmentTrend[];
  } {
    const results = dataSyncService.getResultsByDateRange(startDate, endDate);
    const statistics = dataAggregationService.calculateStatistics(results);
    const trends = this.calculateKeyTrends(results);

    return {
      results,
      statistics,
      trends,
    };
  }

  getDashboardDataByType(type: UnifiedAssessmentResult['assessmentType']): {
    results: UnifiedAssessmentResult[];
    statistics: DataStatistics;
    aggregated: any;
  } {
    const results = dataSyncService.getResultsByType(type);
    const statistics = dataAggregationService.calculateStatistics(results);
    const aggregated = dataAggregationService.getAggregatedData(this.getAssessmentIdByType(type));

    return {
      results,
      statistics,
      aggregated,
    };
  }

  private getAssessmentIdByType(type: UnifiedAssessmentResult['assessmentType']): string {
    const typeMap: Record<string, string> = {
      personality: 'big-five',
      stress: 'stress-test',
      anxiety: 'anxiety-gad7',
    };
    return typeMap[type] || 'unknown';
  }

  async generateComprehensiveReport(
    period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  ): Promise<string> {
    const summary = dataAggregationService.generatePeriodicSummary(period);

    if (!summary) {
      return '暂无足够的测评数据来生成报告';
    }

    return this.formatSummaryAsMarkdown(summary);
  }

  private formatSummaryAsMarkdown(summary: PeriodicSummary): string {
    const lines: string[] = [];
    const periodLabel: Record<string, string> = {
      weekly: '周',
      monthly: '月',
      quarterly: '季度',
      yearly: '年',
    };
    lines.push(`# ${periodLabel[summary.period] ?? summary.period}度综合报告`);
    lines.push('');
    lines.push(`- 统计周期: ${summary.startDate} 至 ${summary.endDate}`);
    lines.push(`- 测评次数: ${summary.assessments.length}`);
    if (summary.overallScore !== undefined) {
      lines.push(`- 平均得分: ${summary.overallScore.toFixed(1)}`);
    }
    if (summary.insights.length > 0) {
      lines.push('');
      lines.push('## 关键洞察');
      for (const i of summary.insights) lines.push(`- ${i}`);
    }
    if (summary.recommendations.length > 0) {
      lines.push('');
      lines.push('## 行动建议');
      summary.recommendations.forEach((r, i) => lines.push(`${i + 1}. ${r}`));
    }
    return lines.join('\n');
  }

  getInsights(): string[] {
    const personalCenter = dataSyncService.getPersonalDataCenter();
    const results = personalCenter.results;

    if (results.length === 0) {
      return ['开始你的第一次测评，开启心理健康追踪之旅'];
    }

    const insights: string[] = [];

    if (results.length < 3) {
      insights.push('建议至少完成3次测评以获得更准确的趋势分析');
    }

    const trends = this.calculateKeyTrends(results);
    const improvingTrends = trends.filter(t => t.trend === 'increasing');
    const decliningTrends = trends.filter(t => t.trend === 'decreasing');

    if (improvingTrends.length > 0) {
      insights.push(`好消息！你有${improvingTrends.length}项特质呈现改善趋势`);
    }

    if (decliningTrends.length > 0) {
      insights.push(`建议关注：${decliningTrends.map(t => t.traitName).join('、')}可能需要调整`);
    }

    const recentResults = this.getRecentResults(results, 5);
    if (recentResults.length > 0) {
      const avgRecentScore =
        recentResults.reduce((sum, r) => sum + r.totalScore, 0) / recentResults.length;

      if (avgRecentScore > 70) {
        insights.push('近期状态良好，继续保持！');
      } else if (avgRecentScore < 40) {
        insights.push('近期状态需要关注，建议进行心理训练');
      }
    }

    return insights;
  }

  getQuickStats(): {
    totalAssessments: number;
    streakDays: number;
    averageScore: number;
    mostRecentType?: string;
  } {
    const personalCenter = dataSyncService.getPersonalDataCenter();
    const results = personalCenter.results;
    const statistics = dataAggregationService.calculateStatistics(results);

    const recent = this.getRecentResults(results, 1);

    return {
      totalAssessments: statistics.totalAssessments,
      streakDays: statistics.streakDays,
      averageScore: Math.round(statistics.averageScore),
      mostRecentType: recent[0]?.assessmentType,
    };
  }
}

export const dashboardService = new DashboardService();

import { storage } from '../../lib/utils';
import { 
  UnifiedAssessmentResult,
  DataStatistics,
  AssessmentTrend,
  TrendDataPoint,
  AssessmentComparison,
  PeriodicSummary,
  TrendAnalysis
} from '../../types/dataAbstraction';
import { dataSyncService } from './DataSyncService';

const PERSONAL_CENTER_KEY = 'personalDataCenter';

class DataAggregationService {
  calculateStatistics(results: UnifiedAssessmentResult[]): DataStatistics {
    if (results.length === 0) {
      return {
        totalAssessments: 0,
        totalTime: 0,
        averageScore: 0,
        assessmentTypes: {
          personality: 0,
          stress: 0,
          anxiety: 0,
          depression: 0,
          emotional: 0,
          cognitive: 0,
          social: 0,
          other: 0
        } as Record<string, number>,
        traitAverages: {},
        tagDistribution: {},
        streakDays: 0
      };
    }

    const assessmentTypes: Record<string, number> = {};
    const traitScores: Record<string, number[]> = {};
    const tagCounts: Record<string, number> = {};
    let totalTime = 0;

    results.forEach(result => {
      assessmentTypes[result.assessmentType] = (assessmentTypes[result.assessmentType] || 0) + 1;
      totalTime += result.metadata.duration || 0;

      result.traits.forEach(trait => {
        if (!traitScores[trait.name]) {
          traitScores[trait.name] = [];
        }
        traitScores[trait.name].push(trait.score);
      });

      result.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const traitAverages: Record<string, number> = {};
    Object.keys(traitScores).forEach(traitName => {
      const scores = traitScores[traitName];
      traitAverages[traitName] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    const totalScore = results.reduce((sum, r) => sum + r.totalScore, 0);
    const averageScore = totalScore / results.length;

    return {
      totalAssessments: results.length,
      totalTime,
      averageScore,
      assessmentTypes: assessmentTypes as any as Record<string, number>,
      traitAverages,
      tagDistribution: tagCounts,
      streakDays: this.calculateStreak(results)
    };
  }

  private calculateStreak(results: UnifiedAssessmentResult[]): number {
    if (results.length === 0) return 0;

    const sortedResults = [...results].sort((a, b) => b.timestamp - a.timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dayStart = currentDate.getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      const hasAssessment = sortedResults.some(
        r => r.timestamp >= dayStart && r.timestamp < dayEnd
      );

      if (hasAssessment) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (i === 0) {
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  calculateTraitTrend(
    results: UnifiedAssessmentResult[],
    traitName: string
  ): AssessmentTrend | null {
    const traitData = results
      .filter(r => r.traits.some(t => t.name === traitName))
      .map(r => {
        const trait = r.traits.find(t => t.name === traitName);
        return {
          timestamp: r.timestamp,
          score: trait?.score || 0,
          resultId: r.id
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    if (traitData.length < 2) return null;

    const dataPoints: TrendDataPoint[] = traitData.map(d => ({
      timestamp: d.timestamp,
      score: d.score,
      resultId: d.resultId
    }));

    const trend = this.determineTrend(dataPoints);
    const change = dataPoints[dataPoints.length - 1].score - dataPoints[0].score;
    const changePercent = dataPoints[0].score !== 0 
      ? (change / dataPoints[0].score) * 100 
      : 0;

    return {
      assessmentId: results[0].assessmentId,
      traitName,
      dataPoints,
      trend,
      change,
      changePercent
    };
  }

  private determineTrend(dataPoints: TrendDataPoint[]): 'increasing' | 'decreasing' | 'stable' {
    if (dataPoints.length < 2) return 'stable';

    const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
    const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));

    const firstAvg = firstHalf.reduce((sum, d) => sum + d.score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.score, 0) / secondHalf.length;

    const changeRatio = Math.abs(secondAvg - firstAvg) / firstAvg;

    if (changeRatio < 0.05) return 'stable';
    return secondAvg > firstAvg ? 'increasing' : 'decreasing';
  }

  compareAssessments(resultIds: string[]): AssessmentComparison | null {
    const personalCenter = this.getPersonalDataCenter();
    const results = personalCenter.results.filter(r => resultIds.includes(r.id));

    if (results.length < 2) return null;

    const traitNames = this.getAllTraitNames(results);
    const comparisonTraits = traitNames.map(traitName => {
      const scores = results.map(r => {
        const trait = r.traits.find(t => t.name === traitName);
        return trait?.score || 0;
      });

      const average = scores.reduce((a, b) => a + b, 0) / scores.length;
      const trend = this.determineTrendFromScores(scores);

      return {
        name: traitName,
        scores,
        average,
        trend,
        change: scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0
      };
    });

    const overallScore = comparisonTraits.reduce((sum, t) => sum + t.average, 0) / comparisonTraits.length;

    const insights = this.generateComparisonInsights(comparisonTraits, results);

    return {
      resultIds,
      traits: comparisonTraits,
      overallScore,
      insights
    };
  }

  private getAllTraitNames(results: UnifiedAssessmentResult[]): string[] {
    const traitSet = new Set<string>();
    results.forEach(r => {
      r.traits.forEach(t => traitSet.add(t.name));
    });
    return Array.from(traitSet);
  }

  private determineTrendFromScores(scores: number[]): 'up' | 'down' | 'stable' {
    if (scores.length < 2) return 'stable';

    const first = scores[0];
    const last = scores[scores.length - 1];
    const changeRatio = Math.abs(last - first) / (first || 1);

    if (changeRatio < 0.05) return 'stable';
    return last > first ? 'up' : 'down';
  }

  private generateComparisonInsights(
    traits: AssessmentComparison['traits'],
    results: UnifiedAssessmentResult[]
  ): string[] {
    const insights: string[] = [];

    const improvingTraits = traits.filter(t => t.trend === 'up');
    if (improvingTraits.length > 0) {
      insights.push(`以下特质有明显进步：${improvingTraits.map(t => t.name).join('、')}`);
    }

    const decliningTraits = traits.filter(t => t.trend === 'down');
    if (decliningTraits.length > 0) {
      insights.push(`以下特质需要关注：${decliningTraits.map(t => t.name).join('、')}`);
    }

    const stableTraits = traits.filter(t => t.trend === 'stable');
    if (stableTraits.length > 0) {
      insights.push(`以下特质保持稳定：${stableTraits.map(t => t.name).join('、')}`);
    }

    const highestTrait = traits.reduce((max, t) => t.average > max.average ? t : max, traits[0]);
    insights.push(`综合表现最强的特质是${highestTrait.name}（平均${highestTrait.average.toFixed(1)}分）`);

    return insights;
  }

  generatePeriodicSummary(
    period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  ): PeriodicSummary | null {
    const personalCenter = this.getPersonalDataCenter();
    const results = personalCenter.results;

    if (results.length === 0) return null;

    const now = Date.now();
    const periodLengths: Record<string, number> = {
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000,
      quarterly: 90 * 24 * 60 * 60 * 1000,
      yearly: 365 * 24 * 60 * 60 * 1000
    };

    const startDate = now - periodLengths[period];
    const periodResults = results.filter(r => r.timestamp >= startDate);

    if (periodResults.length === 0) return null;

    const assessmentIds = periodResults.map(r => r.id);

    const traits = this.getAllTraitNames(periodResults);
    const trends: TrendAnalysis['traits'] = {};

    traits.forEach(traitName => {
      const trend = this.calculateTraitTrend(periodResults, traitName);
      if (trend) {
        trends[traitName] = {
          direction: trend.trend === 'increasing' ? 'up' : trend.trend === 'decreasing' ? 'down' : 'stable',
          change: trend.change,
          changePercent: trend.changePercent
        };
      }
    });

    const overallTrend = this.calculateOverallTrend(periodResults);
    const insights = this.generatePeriodInsights(periodResults, trends);
    const recommendations = this.generateRecommendations(periodResults, trends);

    const overallScore = periodResults.reduce((sum, r) => sum + r.totalScore, 0) / periodResults.length;

    return {
      id: `summary_${period}_${now}`,
      period,
      startDate,
      endDate: now,
      assessments: assessmentIds,
      trends: {
        traits: trends,
        overall: overallTrend
      },
      insights,
      recommendations,
      overallScore,
      createdAt: now
    };
  }

  private calculateOverallTrend(results: UnifiedAssessmentResult[]): TrendAnalysis['overall'] {
    if (results.length < 2) {
      return { direction: 'stable', change: 0 };
    }

    const sorted = [...results].sort((a, b) => a.timestamp - b.timestamp);
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

    const firstAvg = firstHalf.reduce((sum, r) => sum + r.totalScore, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, r) => sum + r.totalScore, 0) / secondHalf.length;

    const change = secondAvg - firstAvg;
    const direction = Math.abs(change) < 5 ? 'stable' : change > 0 ? 'up' : 'down';

    return { direction, change };
  }

  private generatePeriodInsights(results: UnifiedAssessmentResult[], trends: TrendAnalysis['traits']): string[] {
    const insights: string[] = [];

    insights.push(`本周期共完成${results.length}次测评`);

    const improvingCount = Object.values(trends).filter(t => t.direction === 'up').length;
    const decliningCount = Object.values(trends).filter(t => t.direction === 'down').length;

    if (improvingCount > decliningCount) {
      insights.push('整体趋势向好，多数特质有所提升');
    } else if (decliningCount > improvingCount) {
      insights.push('部分特质需要关注，建议加强相关训练');
    } else {
      insights.push('整体状态保持稳定');
    }

    const recentResults = [...results].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
    if (recentResults.length > 0) {
      const avgRecentScore = recentResults.reduce((sum, r) => sum + r.totalScore, 0) / recentResults.length;
      insights.push(`近期平均得分：${avgRecentScore.toFixed(1)}`);
    }

    return insights;
  }

  private generateRecommendations(results: UnifiedAssessmentResult[], trends: TrendAnalysis['traits']): string[] {
    const recommendations: string[] = [];

    const decliningTraits = Object.entries(trends)
      .filter(([_, trend]) => trend.direction === 'down')
      .map(([name]) => name);

    if (decliningTraits.length > 0) {
      recommendations.push(`建议针对${decliningTraits.join('、')}进行专项训练`);
    }

    if (results.length < 3) {
      recommendations.push('建议保持测评频率，以便更好地追踪变化趋势');
    }

    recommendations.push('保持良好的生活习惯和心理调适');

    return recommendations;
  }

  private getPersonalDataCenter(): any {
    try {
      const data = storage.get<any>(PERSONAL_CENTER_KEY, null);
      return data || { results: [], tags: [], summaries: [] };
    } catch {
      return { results: [], tags: [], summaries: [] };
    }
  }

  getAggregatedData(assessmentId: string): {
    count: number;
    averageScore: number;
    traitAverages: Record<string, number>;
    lastResult?: UnifiedAssessmentResult;
  } {
    const personalCenter = this.getPersonalDataCenter();
    const results = personalCenter.results.filter(r => r.assessmentId === assessmentId);

    if (results.length === 0) {
      return {
        count: 0,
        averageScore: 0,
        traitAverages: {}
      };
    }

    const count = results.length;
    const averageScore = results.reduce((sum, r) => sum + r.totalScore, 0) / count;

    const traitNames = this.getAllTraitNames(results);
    const traitAverages: Record<string, number> = {};

    traitNames.forEach(name => {
      const scores = results
        .map(r => r.traits.find(t => t.name === name)?.score || 0);
      traitAverages[name] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    const sorted = [...results].sort((a, b) => b.timestamp - a.timestamp);

    return {
      count,
      averageScore,
      traitAverages,
      lastResult: sorted[0]
    };
  }
}

export const dataAggregationService = new DataAggregationService();

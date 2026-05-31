import { 
  PeriodicSummary,
  UnifiedAssessmentResult,
  AssessmentTrend 
} from '../../types/dataAbstraction';
import { dataSyncService } from '../dataAbstraction/DataSyncService';
import { dataAggregationService } from '../dataAbstraction/DataAggregationService';

class ReportGenerator {
  async generatePeriodicReport(summary: PeriodicSummary): Promise<string> {
    const periodNames = {
      weekly: '周',
      monthly: '月',
      quarterly: '季度',
      yearly: '年'
    };

    const report = [
      `# ${periodNames[summary.period]}度心理健康总结报告`,
      ``,
      `**生成时间**: ${new Date(summary.createdAt).toLocaleString('zh-CN')}`,
      `**统计周期**: ${new Date(summary.startDate).toLocaleDateString('zh-CN')} - ${new Date(summary.endDate).toLocaleDateString('zh-CN')}`,
      `**测评次数**: ${summary.assessments.length}次`,
      ``,
      `## 📊 总体评估`,
      ``,
      summary.overallScore 
        ? `本期平均得分：**${summary.overallScore.toFixed(1)}分**`
        : '本期测评数据不足以计算平均得分',
      ``,
      `## 📈 趋势分析`,
      ``
    ];

    if (Object.keys(summary.trends.traits).length > 0) {
      Object.entries(summary.trends.traits).forEach(([trait, trend]) => {
        const trendIcon = trend.direction === 'up' ? '📈' : trend.direction === 'down' ? '📉' : '➡️';
        const trendText = trend.direction === 'up' ? '上升' : trend.direction === 'down' ? '下降' : '稳定';
        
        report.push(`### ${trait}`);
        report.push(`- ${trendIcon} 趋势：${trendText}`);
        report.push(`- 变化幅度：${trend.change.toFixed(1)}分 (${trend.changePercent.toFixed(1)}%)`);
        report.push(``);
      });
    } else {
      report.push('暂无足够数据生成趋势分析');
      report.push(``);
    }

    report.push(`## 💡 洞察与发现`);
    report.push(``);
    if (summary.insights.length > 0) {
      summary.insights.forEach((insight, index) => {
        report.push(`${index + 1}. ${insight}`);
      });
    } else {
      report.push('暂无洞察数据');
    }
    report.push(``);

    report.push(`## 🎯 建议与行动`);
    report.push(``);
    if (summary.recommendations.length > 0) {
      summary.recommendations.forEach((rec, index) => {
        report.push(`${index + 1}. ${rec}`);
      });
    } else {
      report.push('- 继续保持良好的心理健康习惯');
    }
    report.push(``);

    report.push(`---\n*此报告由 BadHope 心理测评系统自动生成*`);

    return report.join('\n');
  }

  async generateComprehensiveReport(): Promise<string> {
    const personalCenter = dataSyncService.getPersonalDataCenter();
    const results = personalCenter.results;

    if (results.length === 0) {
      return '# 暂无测评数据\n\n请先完成至少一次心理测评，系统将为您生成详细的综合报告。';
    }

    const statistics = dataAggregationService.calculateStatistics(results);
    const weeklySummary = dataAggregationService.generatePeriodicSummary('weekly');
    const monthlySummary = dataAggregationService.generatePeriodicSummary('monthly');

    const report = [
      `# 综合心理健康报告`,
      ``,
      `**生成时间**: ${new Date().toLocaleString('zh-CN')}`,
      `**报告周期**: 所有历史测评数据`,
      ``,
      `## 📋 基本统计`,
      ``,
      `- 总测评次数：${statistics.totalAssessments}次`,
      `- 连续测评天数：${statistics.streakDays}天`,
      `- 平均得分：${statistics.averageScore.toFixed(1)}分`,
      `- 总测评时长：${Math.round(statistics.totalTime / 60)}分钟`,
      ``
    ];

    report.push(`## 📊 测评类型分布`);
    report.push(``);
    if (Object.keys(statistics.assessmentTypes).length > 0) {
      Object.entries(statistics.assessmentTypes).forEach(([type, count]) => {
        if (count > 0) {
          report.push(`- ${this.getTypeName(type)}：${count}次`);
        }
      });
    } else {
      report.push('暂无数据');
    }
    report.push(``);

    report.push(`## 🏷️ 标签分布`);
    report.push(``);
    if (Object.keys(statistics.tagDistribution).length > 0) {
      const sortedTags = Object.entries(statistics.tagDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      sortedTags.forEach(([tag, count]) => {
        report.push(`- ${tag}：${count}次`);
      });
    } else {
      report.push('暂无标签数据');
    }
    report.push(``);

    report.push(`## 📈 特质平均分`);
    report.push(``);
    if (Object.keys(statistics.traitAverages).length > 0) {
      Object.entries(statistics.traitAverages).forEach(([trait, avg]) => {
        const bar = this.generateScoreBar(avg as number);
        report.push(`- ${trait}：${bar} ${(avg as number).toFixed(1)}分`);
      });
    } else {
      report.push('暂无特质数据');
    }
    report.push(``);

    if (monthlySummary) {
      report.push(`## 📅 本月总结`);
      report.push(``);
      if (monthlySummary.insights.length > 0) {
        monthlySummary.insights.forEach(insight => {
          report.push(`- ${insight}`);
        });
      }
      report.push(``);
    }

    report.push(`---\n*此报告由 BadHope 心理测评系统自动生成*`);

    return report.join('\n');
  }

  private getTypeName(type: string): string {
    const typeNames: Record<string, string> = {
      'personality': '人格测评',
      'stress': '压力测评',
      'anxiety': '焦虑测评',
      'depression': '抑郁测评',
      'emotional': '情绪测评',
      'cognitive': '认知测评',
      'social': '社交测评',
      'other': '其他测评'
    };
    return typeNames[type] || type;
  }

  private generateScoreBar(score: number, maxScore: number = 100, length: number = 20): string {
    const filled = Math.round((score / maxScore) * length);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  async generateResultComparison(resultIds: string[]): Promise<string> {
    const comparison = dataAggregationService.compareAssessments(resultIds);

    if (!comparison) {
      return '# 数据不足\n\n需要至少2次测评才能生成对比报告。';
    }

    const report = [
      `# 测评结果对比报告`,
      ``,
      `**对比测评数**: ${comparison.resultIds.length}次`,
      `**生成时间**: ${new Date().toLocaleString('zh-CN')}`,
      ``,
      `## 📊 综合得分`,
      ``,
      `**平均得分**: ${comparison.overallScore.toFixed(1)}分`,
      ``
    ];

    report.push(`## 📈 特质对比`);
    report.push(``);

    comparison.traits.forEach(trait => {
      report.push(`### ${trait.name}`);
      report.push(`- 平均得分：${trait.average.toFixed(1)}分`);
      
      const trendIcon = trait.trend === 'up' ? '📈' : trait.trend === 'down' ? '📉' : '➡️';
      const trendText = trait.trend === 'up' ? '上升' : trait.trend === 'down' ? '下降' : '稳定';
      report.push(`- 趋势：${trendIcon} ${trendText}`);
      
      if (trait.change !== 0) {
        const changeText = trait.change > 0 ? `+${trait.change.toFixed(1)}` : trait.change.toFixed(1);
        report.push(`- 变化：${changeText}分`);
      }
      
      report.push(``);
    });

    report.push(`## 💡 对比洞察`);
    report.push(``);
    if (comparison.insights.length > 0) {
      comparison.insights.forEach(insight => {
        report.push(`- ${insight}`);
      });
    } else {
      report.push('暂无对比洞察');
    }
    report.push(``);

    report.push(`---\n*此报告由 BadHope 心理测评系统自动生成*`);

    return report.join('\n');
  }
}

export const reportGenerator = new ReportGenerator();

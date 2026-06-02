import { storage } from '../../lib/utils';
import { UnifiedAssessmentResult, DataSyncStatus, SyncConflict } from '../../types/dataAbstraction';

const PERSONAL_CENTER_KEY = 'personalDataCenter';

class DataSyncService {
  private syncStatus: DataSyncStatus = {
    lastSync: 0,
    status: 'idle',
    progress: 0,
    conflicts: [],
  };

  async syncAllAssessments(): Promise<void> {
    try {
      this.syncStatus.status = 'syncing';
      this.syncStatus.progress = 0;

      const assessments = this.loadAllAssessmentsFromHistory();
      const personalCenter = this.getPersonalDataCenter();

      const existingIds = new Set(personalCenter.results.map(r => r.id));
      const newResults = assessments.filter(a => !existingIds.has(a.id));

      this.syncStatus.progress = 50;

      for (const result of newResults) {
        personalCenter.results.push(this.normalizeResult(result));
      }

      personalCenter.results.sort((a, b) => b.timestamp - a.timestamp);
      personalCenter.lastUpdated = Date.now();

      this.syncStatus.progress = 90;

      this.savePersonalDataCenter(personalCenter);

      this.syncStatus.progress = 100;
      this.syncStatus.status = 'success';
      this.syncStatus.lastSync = Date.now();
    } catch (error) {
      this.syncStatus.status = 'error';
      console.error('Data sync failed:', error);
      throw error;
    }
  }

  private loadAllAssessmentsFromHistory(): UnifiedAssessmentResult[] {
    try {
      const historyData = storage.get<any>('assessmentHistory', null);
      if (!historyData) return [];

      const history = Array.isArray(historyData) ? historyData : [historyData];

      return history.map(item => this.convertToUnifiedFormat(item)).filter(Boolean);
    } catch (error) {
      console.error('Failed to load assessments from history:', error);
      return [];
    }
  }

  private convertToUnifiedFormat(result: any): UnifiedAssessmentResult | null {
    if (!result || !result.id) return null;

    return {
      id: result.id,
      assessmentId: result.assessmentId || result.assessment_id || 'unknown',
      assessmentType: this.detectAssessmentType(result.assessmentId || result.assessment_id),
      title: result.title || '心理测评',
      timestamp: result.timestamp || Date.now(),
      totalScore: result.totalScore || result.total_score || 0,
      traits: this.normalizeTraits(result.traits || result.traitScores || []),
      rawAnswers: result.rawAnswers || result.answers || {},
      processedScores: result.processedScores || {},
      report: result.report || {},
      tags: result.tags || [],
      metadata: {
        duration: result.metadata?.duration || result.duration || 0,
        completed: result.metadata?.completed ?? result.completed ?? true,
        version: result.metadata?.version || '1.0.0',
      },
    };
  }

  private detectAssessmentType(assessmentId: string): UnifiedAssessmentResult['assessmentType'] {
    const typeMap: Record<string, UnifiedAssessmentResult['assessmentType']> = {
      'big-five': 'personality',
      'stress-test': 'stress',
      'anxiety-gad7': 'anxiety',
    };

    return typeMap[assessmentId] || 'other';
  }

  private normalizeTraits(traits: any[]): UnifiedAssessmentResult['traits'] {
    return traits.map(trait => ({
      name: trait.name || trait.traitName || 'Unknown',
      score: trait.score || 0,
      description: trait.description || '',
      percentile: trait.percentile,
      tScore: trait.tScore,
      rawScore: trait.rawScore,
      maxScore: trait.maxScore,
      level: this.calculateTraitLevel(trait.score, trait.maxScore),
    }));
  }

  private calculateTraitLevel(score: number, maxScore?: number): 'low' | 'medium' | 'high' {
    if (!maxScore) return 'medium';
    const percentage = score / maxScore;
    if (percentage < 0.33) return 'low';
    if (percentage > 0.66) return 'high';
    return 'medium';
  }

  private normalizeResult(result: UnifiedAssessmentResult): UnifiedAssessmentResult {
    return {
      ...result,
      traits: this.normalizeTraits(result.traits),
      metadata: {
        ...result.metadata,
        version: '1.0.0',
      },
    };
  }

  getPersonalDataCenter(): any {
    try {
      const data = storage.get<any>(PERSONAL_CENTER_KEY, null);
      if (data) return data;

      return {
        userId: 'default',
        results: [],
        tags: [],
        summaries: [],
        lastUpdated: Date.now(),
        statistics: {
          totalAssessments: 0,
          totalTime: 0,
          averageScore: 0,
          assessmentTypes: {},
          traitAverages: {},
          tagDistribution: {},
          streakDays: 0,
        },
      };
    } catch (error) {
      console.error('Failed to get personal data center:', error);
      return null;
    }
  }

  private savePersonalDataCenter(data: any): void {
    storage.set(PERSONAL_CENTER_KEY, data);
  }

  getSyncStatus(): DataSyncStatus {
    return { ...this.syncStatus };
  }

  async resolveConflict(conflict: SyncConflict, resolution: 'local' | 'remote'): Promise<void> {
    const personalCenter = this.getPersonalDataCenter();
    const index = personalCenter.results.findIndex(r => r.id === conflict.recordId);

    if (index !== -1) {
      personalCenter.results[index] =
        resolution === 'local' ? conflict.localData : conflict.remoteData;

      this.savePersonalDataCenter(personalCenter);
    }

    this.syncStatus.conflicts = this.syncStatus.conflicts.filter(
      c => c.recordId !== conflict.recordId
    );
  }

  getResultsByType(type: UnifiedAssessmentResult['assessmentType']): UnifiedAssessmentResult[] {
    const personalCenter = this.getPersonalDataCenter();
    return personalCenter.results.filter(r => r.assessmentType === type);
  }

  getResultsByDateRange(startDate: number, endDate: number): UnifiedAssessmentResult[] {
    const personalCenter = this.getPersonalDataCenter();
    return personalCenter.results.filter(r => r.timestamp >= startDate && r.timestamp <= endDate);
  }

  searchResults(query: string): UnifiedAssessmentResult[] {
    const personalCenter = this.getPersonalDataCenter();
    const lowerQuery = query.toLowerCase();

    return personalCenter.results.filter(
      r =>
        r.title.toLowerCase().includes(lowerQuery) ||
        r.assessmentId.toLowerCase().includes(lowerQuery) ||
        r.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
}

export const dataSyncService = new DataSyncService();

import { storage } from '../../lib/utils';
import { 
  UnifiedAssessmentResult,
  DataMigration,
  MigrationRecord,
  MigrationError 
} from '../../types/dataAbstraction';
import { dataSyncService } from './DataSyncService';
import { dataValidationService } from './DataValidationService';

const ASSESSMENT_HISTORY_KEY = 'assessmentHistory';
const PERSONAL_CENTER_KEY = 'personalDataCenter';
const CURRENT_VERSION = '2.0.0';

class DataMigrationService {
  private migrations: Map<string, DataMigration> = new Map();

  async migrateToV2(): Promise<DataMigration> {
    const migration: DataMigration = {
      fromVersion: '1.0.0',
      toVersion: '2.0.0',
      status: 'in_progress',
      records: [],
      errors: [],
      startedAt: Date.now()
    };

    try {
      const oldData = this.loadOldData();
      
      migration.records = await this.migrateRecords(oldData);

      if (migration.errors.length === 0) {
        migration.status = 'completed';
        migration.completedAt = Date.now();
        
        await this.finalizeMigration();
      } else {
        migration.status = 'failed';
      }

      this.migrations.set('v1_to_v2', migration);
      return migration;

    } catch (error) {
      migration.status = 'failed';
      migration.errors.push({
        recordId: 'system',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        recoverable: false
      });
      throw error;
    }
  }

  private loadOldData(): any[] {
    try {
      const historyData = storage.get<any>(ASSESSMENT_HISTORY_KEY, null);
      if (!historyData) return [];

      const history = Array.isArray(historyData) ? historyData : [historyData];
      return history;
    } catch (error) {
      console.error('Failed to load old data:', error);
      return [];
    }
  }

  private async migrateRecords(oldData: any[]): Promise<MigrationRecord[]> {
    const records: MigrationRecord[] = [];

    for (const item of oldData) {
      const record: MigrationRecord = {
        recordId: item.id || `record_${Date.now()}_${records.length}`,
        status: 'pending'
      };

      try {
        const migratedData = this.migrateRecord(item);
        
        const validation = dataValidationService.validateResult(migratedData);
        
        if (validation.valid) {
          record.status = 'success';
          record.originalData = item;
          record.migratedData = migratedData;
        } else {
          record.status = 'failed';
          record.originalData = item;
          record.error = `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`;
        }

      } catch (error) {
        record.status = 'failed';
        record.originalData = item;
        record.error = error instanceof Error ? error.message : 'Migration failed';
      }

      records.push(record);
    }

    return records;
  }

  private migrateRecord(oldRecord: any): UnifiedAssessmentResult {
    return {
      id: oldRecord.id || `migrated_${Date.now()}`,
      assessmentId: this.migrateAssessmentId(oldRecord.assessmentId || oldRecord.assessment_id),
      assessmentType: this.detectAssessmentTypeV2(oldRecord.assessmentId || oldRecord.assessment_id),
      title: oldRecord.title || '心理测评',
      timestamp: oldRecord.timestamp || Date.now(),
      totalScore: oldRecord.totalScore ?? oldRecord.total_score ?? 0,
      traits: this.migrateTraits(oldRecord.traits || oldRecord.traitScores || []),
      rawAnswers: oldRecord.rawAnswers || oldRecord.answers || {},
      processedScores: oldRecord.processedScores || {},
      report: oldRecord.report || this.generateDefaultReport(oldRecord),
      tags: oldRecord.tags || [],
      metadata: {
        duration: oldRecord.metadata?.duration || oldRecord.duration || 0,
        completed: oldRecord.metadata?.completed ?? oldRecord.completed ?? true,
        version: CURRENT_VERSION
      }
    };
  }

  private migrateAssessmentId(oldId: string): string {
    const idMap: Record<string, string> = {
      '1': 'big-five',
      'big_five': 'big-five',
      'bigfive': 'big-five',
      '2': 'stress-test',
      'stress': 'stress-test',
      '3': 'anxiety-gad7',
      'gad7': 'anxiety-gad7',
      'gad_7': 'anxiety-gad7'
    };

    return idMap[oldId] || oldId;
  }

  private detectAssessmentTypeV2(assessmentId: string): UnifiedAssessmentResult['assessmentType'] {
    const typeMap: Record<string, UnifiedAssessmentResult['assessmentType']> = {
      'big-five': 'personality',
      'stress-test': 'stress',
      'anxiety-gad7': 'anxiety'
    };

    return typeMap[assessmentId] || 'other';
  }

  private migrateTraits(oldTraits: any[]): UnifiedAssessmentResult['traits'] {
    if (!Array.isArray(oldTraits)) return [];

    return oldTraits.map(trait => ({
      name: trait.name || trait.traitName || 'Unknown',
      score: trait.score || 0,
      description: trait.description || '',
      percentile: trait.percentile,
      tScore: trait.tScore,
      rawScore: trait.rawScore,
      maxScore: trait.maxScore,
      level: this.calculateTraitLevel(trait.score, trait.maxScore)
    }));
  }

  private calculateTraitLevel(score: number, maxScore?: number): 'low' | 'medium' | 'high' {
    if (!maxScore) return 'medium';
    const percentage = score / maxScore;
    if (percentage < 0.33) return 'low';
    if (percentage > 0.66) return 'high';
    return 'medium';
  }

  private generateDefaultReport(record: any): UnifiedAssessmentResult['report'] {
    return {
      summary: {
        title: record.title || '测评结果',
        score: record.totalScore || 0,
        description: '已完成测评',
        color: 'blue'
      },
      strengths: [],
      weaknesses: [],
      recommendations: []
    };
  }

  private async finalizeMigration(): Promise<void> {
    const personalCenter = dataSyncService.getPersonalDataCenter();
    
    personalCenter.results.forEach(result => {
      result.metadata.version = CURRENT_VERSION;
    });

    storage.set(PERSONAL_CENTER_KEY, personalCenter);

    storage.remove(ASSESSMENT_HISTORY_KEY);
  }

  getMigrationStatus(migrationId: string): DataMigration | undefined {
    return this.migrations.get(migrationId);
  }

  getAllMigrations(): DataMigration[] {
    return Array.from(this.migrations.values());
  }

  async rollbackMigration(migrationId: string): Promise<boolean> {
    try {
      const migration = this.migrations.get(migrationId);
      if (!migration || migration.status !== 'completed') {
        return false;
      }

      const personalCenter = dataSyncService.getPersonalDataCenter();
      
      const failedRecords = migration.records.filter(r => r.originalData);
      failedRecords.forEach(record => {
        if (record.originalData) {
          const index = personalCenter.results.findIndex(r => r.id === record.recordId);
          if (index !== -1) {
            personalCenter.results[index] = this.migrateRecord(record.originalData);
          }
        }
      });

      storage.set(PERSONAL_CENTER_KEY, personalCenter);

      migration.status = 'failed';
      migration.errors.push({
        recordId: 'system',
        error: 'Migration rolled back',
        recoverable: false
      });

      return true;
    } catch (error) {
      console.error('Rollback failed:', error);
      return false;
    }
  }

  validateMigratedData(): {
    valid: number;
    invalid: number;
    details: Array<{ id: string; errors: string[] }>;
  } {
    const personalCenter = dataSyncService.getPersonalDataCenter();
    const results = personalCenter.results;

    const validResults = results.filter(r => r.metadata.version === CURRENT_VERSION);
    const validationDetails = results.map(r => {
      const validation = dataValidationService.validateResult(r);
      return {
        id: r.id,
        errors: validation.errors.map(e => e.message)
      };
    });

    return {
      valid: validResults.length,
      invalid: results.length - validResults.length,
      details: validationDetails.filter(d => d.errors.length > 0)
    };
  }

  async exportMigrationReport(migrationId: string): Promise<string> {
    const migration = this.migrations.get(migrationId);
    if (!migration) {
      return 'Migration not found';
    }

    const report = [
      `# 数据迁移报告`,
      ``,
      `**迁移ID**: ${migrationId}`,
      `**状态**: ${migration.status}`,
      `**时间**: ${new Date(migration.startedAt || 0).toLocaleString()}`,
      ``,
      `## 迁移详情`,
      ``,
      `**从版本**: ${migration.fromVersion}`,
      `**到版本**: ${migration.toVersion}`,
      `**总记录数**: ${migration.records.length}`,
      `**成功**: ${migration.records.filter(r => r.status === 'success').length}`,
      `**失败**: ${migration.records.filter(r => r.status === 'failed').length}`,
      ``
    ];

    if (migration.errors.length > 0) {
      report.push(`## 错误信息`);
      report.push(``);
      migration.errors.forEach((error, index) => {
        report.push(`${index + 1}. **记录ID**: ${error.recordId}`);
        report.push(`   **错误**: ${error.error}`);
        if (error.stack) {
          report.push(`   **堆栈**: ${error.stack}`);
        }
        report.push(``);
      });
    }

    return report.join('\n');
  }
}

export const dataMigrationService = new DataMigrationService();

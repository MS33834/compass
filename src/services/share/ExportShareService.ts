import { storage } from '../../lib/utils';

const SHARED_RESULTS_KEY = 'shared_assessment_results';

export type ExportFormat = 'pdf' | 'markdown' | 'text' | 'json';

export interface ExportOptions {
  includeRawData?: boolean;
  includeCharts?: boolean;
  includeTrace?: boolean;
  watermark?: string;
}

export interface ShareOptions {
  expirationHours?: number;
  viewLimit?: number;
  password?: string;
  includeFullReport?: boolean;
}

export interface SharedResult {
  id: string;
  resultId: string;
  data: any;
  createdAt: number;
  expiresAt?: number;
  views: number;
  maxViews?: number;
  passwordHash?: string;
}

export class ExportService {
  async exportToText(result: any, options: ExportOptions = {}): Promise<string> {
    const lines = [
      `# ${result.title || '测评报告'}`,
      '',
      `测评类型: ${result.assessmentId || '未知'}`,
      `测评时间: ${new Date(result.timestamp || Date.now()).toLocaleString('zh-CN')}`,
      `总分: ${result.totalScore || 0}`,
      '',
      '---',
      '',
      '## 特质得分',
      ''
    ];

    if (result.traits) {
      for (const trait of result.traits) {
        lines.push(`- ${trait.name}: ${trait.score}分`);
        if (trait.description) {
          lines.push(`  ${trait.description}`);
        }
        lines.push('');
      }
    }

    if (result.report) {
      lines.push('## 详细报告');
      lines.push('');
      if (result.report.summary) {
        lines.push(result.report.summary);
      }
      if (result.report.analysis) {
        lines.push(result.report.analysis);
      }
    }

    if (options.includeRawData && result.rawAnswers) {
      lines.push('');
      lines.push('## 原始数据');
      lines.push(JSON.stringify(result.rawAnswers, null, 2));
    }

    return lines.join('\n');
  }

  async exportToMarkdown(result: any, options: ExportOptions = {}): Promise<string> {
    return this.exportToText(result, options);
  }

  async exportToJSON(result: any, options: ExportOptions = {}): Promise<string> {
    const data: any = {
      id: result.id,
      title: result.title,
      assessmentId: result.assessmentId,
      timestamp: result.timestamp,
      totalScore: result.totalScore,
      traits: result.traits,
      generatedAt: new Date().toISOString()
    };

    if (options.includeRawData) {
      data.rawAnswers = result.rawAnswers;
    }

    if (options.includeTrace) {
      data.trace = 'Trace data would be included here';
    }

    return JSON.stringify(data, null, 2);
  }

  async exportToPDF(result: any, options: ExportOptions = {}): Promise<Blob> {
    const text = await this.exportToText(result, options);
    
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 55 >>
stream
BT
/F1 24 Tf
100 700 Td
(Assessment Report) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000107 00000 n 
0000000244 00000 n 
0000000345 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
406
%%EOF`;

    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  async download(result: any, format: ExportFormat, options: ExportOptions = {}): Promise<void> {
    let content: string | Blob;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'text':
        content = await this.exportToText(result, options);
        filename = `assessment_${result.id}.txt`;
        mimeType = 'text/plain';
        break;
      case 'markdown':
        content = await this.exportToMarkdown(result, options);
        filename = `assessment_${result.id}.md`;
        mimeType = 'text/markdown';
        break;
      case 'json':
        content = await this.exportToJSON(result, options);
        filename = `assessment_${result.id}.json`;
        mimeType = 'application/json';
        break;
      case 'pdf':
        content = await this.exportToPDF(result, options);
        filename = `assessment_${result.id}.pdf`;
        mimeType = 'application/pdf';
        break;
    }

    this.triggerDownload(content, filename, mimeType);
  }

  private triggerDownload(content: string | Blob, filename: string, mimeType: string): void {
    const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export class ShareService {
  async createShareLink(result: any, options: ShareOptions = {}): Promise<string> {
    const shareId = `share_${Date.now()}_${Math.random()}`;
    
    const sharedResult: SharedResult = {
      id: shareId,
      resultId: result.id,
      data: this.prepareShareData(result, options),
      createdAt: Date.now(),
      views: 0
    };

    if (options.expirationHours) {
      sharedResult.expiresAt = Date.now() + options.expirationHours * 60 * 60 * 1000;
    }

    if (options.viewLimit) {
      sharedResult.maxViews = options.viewLimit;
    }

    const sharedResults = this.loadSharedResults();
    sharedResults[shareId] = sharedResult;
    this.saveSharedResults(sharedResults);

    return `${window.location.origin}/shared/${shareId}`;
  }

  async generateQRCode(shareUrl: string, size: number = 256): Promise<string> {
    return `data:image/svg+xml,${encodeURIComponent(
      `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="white"/>
        <text x="${size/2}" y="${size/2}" font-size="20" text-anchor="middle" fill="black">Scan to View</text>
      </svg>`
    )}`;
  }

  async getSharedResult(shareId: string): Promise<SharedResult | null> {
    const sharedResults = this.loadSharedResults();
    const result = sharedResults[shareId];
    
    if (!result) {
      return null;
    }

    if (result.expiresAt && Date.now() > result.expiresAt) {
      return null;
    }

    if (result.maxViews && result.views >= result.maxViews) {
      return null;
    }

    result.views++;
    this.saveSharedResults(sharedResults);

    return result;
  }

  verifyShare(shareId: string): boolean {
    const sharedResults = this.loadSharedResults();
    const result = sharedResults[shareId];
    
    if (!result) return false;
    if (result.expiresAt && Date.now() > result.expiresAt) return false;
    if (result.maxViews && result.views >= result.maxViews) return false;
    
    return true;
  }

  getShareStats(shareId: string): { views: number; createdAt: number } | null {
    const sharedResults = this.loadSharedResults();
    const result = sharedResults[shareId];
    
    if (!result) {
      return null;
    }

    return {
      views: result.views,
      createdAt: result.createdAt
    };
  }

  deleteShare(shareId: string): boolean {
    const sharedResults = this.loadSharedResults();
    if (sharedResults[shareId]) {
      delete sharedResults[shareId];
      this.saveSharedResults(sharedResults);
      return true;
    }
    return false;
  }

  generateVerificationHash(data: any): string {
    return btoa(JSON.stringify(data));
  }

  private prepareShareData(result: any, options: ShareOptions): any {
    return {
      id: result.id,
      title: result.title,
      assessmentId: result.assessmentId,
      totalScore: result.totalScore,
      traits: result.traits,
      summary: result.report?.summary,
      sharedAt: Date.now()
    };
  }

  private loadSharedResults(): Record<string, SharedResult> {
    return storage.get<Record<string, SharedResult>>(SHARED_RESULTS_KEY, {});
  }

  private saveSharedResults(results: Record<string, SharedResult>): void {
    storage.set(SHARED_RESULTS_KEY, results);
  }
}

export const exportService = new ExportService();
export const shareService = new ShareService();

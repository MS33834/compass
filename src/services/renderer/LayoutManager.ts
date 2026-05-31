import { AssessmentLayoutConfig } from './types';

const DEFAULT_LAYOUTS: Record<string, AssessmentLayoutConfig> = {
  'big-five': {
    assessmentId: 'big-five',
    layoutType: 'card',
    theme: {
      primary: '#4F46E5',
      secondary: '#818CF8',
      accent: '#C7D2FE',
      background: '#EEF2FF'
    },
    questionDisplay: 'single',
    navigationStyle: 'vertical',
    progressIndicator: 'bar',
    feedbackStyle: 'end'
  },
  'stress-test': {
    assessmentId: 'stress-test',
    layoutType: 'timeline',
    theme: {
      primary: '#059669',
      secondary: '#34D399',
      accent: '#A7F3D0',
      background: '#ECFDF5'
    },
    questionDisplay: 'batch',
    navigationStyle: 'floating',
    progressIndicator: 'steps',
    feedbackStyle: 'adaptive'
  },
  'anxiety-gad7': {
    assessmentId: 'anxiety-gad7',
    layoutType: 'card',
    theme: {
      primary: '#0891B2',
      secondary: '#22D3EE',
      accent: '#A5F3FC',
      background: '#ECFEFF'
    },
    questionDisplay: 'single',
    navigationStyle: 'vertical',
    progressIndicator: 'dots',
    feedbackStyle: 'immediate'
  }
};

export class LayoutManager {
  private layouts: Map<string, string>;
  private customLayouts: Map<string, AssessmentLayoutConfig>;

  constructor() {
    this.layouts = new Map();
    this.customLayouts = new Map();
    
    Object.keys(DEFAULT_LAYOUTS).forEach(id => {
      this.layouts.set(id, DEFAULT_LAYOUTS[id].layoutType);
    });
  }

  registerLayout(assessmentId: string, layoutType: string): void {
    this.layouts.set(assessmentId, layoutType);
  }

  getLayoutType(assessmentId: string): string {
    return this.layouts.get(assessmentId) || 'card';
  }

  getDefaultLayout(assessmentId: string): AssessmentLayoutConfig {
    return DEFAULT_LAYOUTS[assessmentId] || {
      assessmentId,
      layoutType: 'card',
      theme: {
        primary: '#3B82F6',
        secondary: '#60A5FA',
        accent: '#93C5FD',
        background: '#EFF6FF'
      },
      questionDisplay: 'single',
      navigationStyle: 'vertical',
      progressIndicator: 'bar',
      feedbackStyle: 'end'
    };
  }

  getAllLayoutTypes(): Record<string, string> {
    return Object.fromEntries(this.layouts);
  }

  hasCustomLayout(assessmentId: string): boolean {
    return this.customLayouts.has(assessmentId);
  }

  getCustomLayout(assessmentId: string): AssessmentLayoutConfig | undefined {
    return this.customLayouts.get(assessmentId);
  }

  registerCustomLayout(config: AssessmentLayoutConfig): void {
    this.customLayouts.set(config.assessmentId, config);
    this.layouts.set(config.assessmentId, config.layoutType);
  }

  removeCustomLayout(assessmentId: string): boolean {
    if (!this.customLayouts.has(assessmentId)) {
      return false;
    }

    this.customLayouts.delete(assessmentId);
    
    if (DEFAULT_LAYOUTS[assessmentId]) {
      this.layouts.set(assessmentId, DEFAULT_LAYOUTS[assessmentId].layoutType);
    } else {
      this.layouts.delete(assessmentId);
    }

    return true;
  }

  updateLayout(assessmentId: string, layoutType: 'card' | 'timeline' | 'grid' | 'custom'): void {
    if (this.customLayouts.has(assessmentId)) {
      const current = this.customLayouts.get(assessmentId)!;
      this.customLayouts.set(assessmentId, { ...current, layoutType });
    }
    this.layouts.set(assessmentId, layoutType);
  }

  getLayoutStatistics(): {
    total: number;
    custom: number;
    default: number;
    byType: Record<string, number>;
  } {
    const byType: Record<string, number> = {};
    let custom = 0;

    this.layouts.forEach(type => {
      byType[type] = (byType[type] || 0) + 1;
    });

    this.customLayouts.forEach(() => {
      custom++;
    });

    return {
      total: this.layouts.size,
      custom,
      default: this.layouts.size - custom,
      byType
    };
  }
}

export const layoutManager = new LayoutManager();

import { Question } from '../../types';
import { AssessmentLayoutConfig } from './types';
import { LayoutManager } from './LayoutManager';
import { ThemeEngine } from './ThemeEngine';

class AssessmentRenderer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private layoutManager: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private themeEngine: any;
  private customLayouts: Map<string, AssessmentLayoutConfig>;

  constructor() {
    this.layoutManager = new LayoutManager();
    this.themeEngine = new ThemeEngine();
    this.customLayouts = new Map();
  }

  registerCustomLayout(assessmentId: string, config: AssessmentLayoutConfig): void {
    this.customLayouts.set(assessmentId, config);
    this.layoutManager.registerLayout(assessmentId, config.layoutType);
    this.themeEngine.registerTheme(assessmentId, config.theme);
  }

  getLayoutConfig(assessmentId: string): AssessmentLayoutConfig | null {
    return this.customLayouts.get(assessmentId) || null;
  }

  getLayout(assessmentId: string): AssessmentLayoutConfig {
    const custom = this.customLayouts.get(assessmentId);
    if (custom) return custom;

    return this.layoutManager.getDefaultLayout(assessmentId);
  }

  getTheme(assessmentId: string) {
    return this.themeEngine.getTheme(assessmentId);
  }

  renderLayoutType(assessmentId: string): string {
    const config = this.getLayout(assessmentId);
    return config.layoutType;
  }

  getQuestionDisplayMode(assessmentId: string): 'single' | 'batch' | 'all' {
    const config = this.getLayout(assessmentId);
    return config.questionDisplay;
  }

  getNavigationStyle(assessmentId: string): 'vertical' | 'horizontal' | 'floating' {
    const config = this.getLayout(assessmentId);
    return config.navigationStyle;
  }

  getProgressIndicator(assessmentId: string): 'bar' | 'dots' | 'steps' {
    const config = this.getLayout(assessmentId);
    return config.progressIndicator;
  }

  getFeedbackStyle(assessmentId: string): 'immediate' | 'end' | 'adaptive' {
    const config = this.getLayout(assessmentId);
    return config.feedbackStyle;
  }

  updateLayout(assessmentId: string, updates: Partial<AssessmentLayoutConfig>): void {
    const current = this.getLayout(assessmentId);
    const updated = { ...current, ...updates };
    this.customLayouts.set(assessmentId, updated);
  }

  getAllRegisteredLayouts(): AssessmentLayoutConfig[] {
    return Array.from(this.customLayouts.values());
  }

  removeCustomLayout(assessmentId: string): boolean {
    return this.customLayouts.delete(assessmentId);
  }

  getThemeColors(assessmentId: string): {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  } {
    const config = this.getLayout(assessmentId);
    return config.theme;
  }

  generateThemeCSS(assessmentId: string): string {
    const colors = this.getThemeColors(assessmentId);
    return `
      --assessment-primary: ${colors.primary};
      --assessment-secondary: ${colors.secondary};
      --assessment-accent: ${colors.accent};
      --assessment-background: ${colors.background};
    `;
  }
}

export const assessmentRenderer = new AssessmentRenderer();

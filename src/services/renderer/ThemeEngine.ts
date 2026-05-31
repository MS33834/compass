import { ThemeConfig } from './types';

const DEFAULT_THEMES: Record<string, ThemeConfig> = {
  'big-five': {
    id: 'big-five',
    name: '人格测评主题',
    colors: {
      primary: '#4F46E5',
      secondary: '#818CF8',
      accent: '#C7D2FE',
      background: '#EEF2FF',
      text: '#1F2937',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    }
  },
  'stress-test': {
    id: 'stress-test',
    name: '压力测评主题',
    colors: {
      primary: '#059669',
      secondary: '#34D399',
      accent: '#A7F3D0',
      background: '#ECFDF5',
      text: '#1F2937',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      secondary: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    }
  },
  'anxiety-gad7': {
    id: 'anxiety-gad7',
    name: '焦虑测评主题',
    colors: {
      primary: '#0891B2',
      secondary: '#22D3EE',
      accent: '#A5F3FC',
      background: '#ECFEFF',
      text: '#1F2937',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #0fd850 0%, #f9f047 100%)',
      secondary: 'linear-gradient(135deg, #24fe92 0%, #f8f553 100%)'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
    }
  }
};

export class ThemeEngine {
  private themes: Map<string, ThemeConfig>;
  private activeTheme: string = 'big-five';

  constructor() {
    this.themes = new Map();
    
    Object.keys(DEFAULT_THEMES).forEach(id => {
      this.themes.set(id, DEFAULT_THEMES[id]);
    });
  }

  registerTheme(assessmentId: string, theme: ThemeConfig['colors']): void {
    const fullTheme: ThemeConfig = {
      id: assessmentId,
      name: `${assessmentId} 主题`,
      colors: theme,
      gradients: {
        primary: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
        secondary: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.primary} 100%)`
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: `0 4px 6px -1px ${theme.primary}20`,
        lg: `0 10px 15px -3px ${theme.primary}30`
      }
    };

    this.themes.set(assessmentId, fullTheme);
  }

  getTheme(assessmentId: string): ThemeConfig {
    return this.themes.get(assessmentId) || DEFAULT_THEMES['big-five'];
  }

  setActiveTheme(assessmentId: string): void {
    if (this.themes.has(assessmentId)) {
      this.activeTheme = assessmentId;
    }
  }

  getActiveTheme(): ThemeConfig {
    return this.themes.get(this.activeTheme) || DEFAULT_THEMES['big-five'];
  }

  getColor(assessmentId: string, colorKey: keyof ThemeConfig['colors']): string {
    const theme = this.getTheme(assessmentId);
    return theme.colors[colorKey];
  }

  generateCSSVariables(assessmentId: string): string {
    const theme = this.getTheme(assessmentId);
    
    return `
      --theme-primary: ${theme.colors.primary};
      --theme-secondary: ${theme.colors.secondary};
      --theme-accent: ${theme.colors.accent};
      --theme-background: ${theme.colors.background};
      --theme-text: ${theme.colors.text};
      --theme-border: ${theme.colors.border};
      --theme-success: ${theme.colors.success};
      --theme-warning: ${theme.colors.warning};
      --theme-error: ${theme.colors.error};
    `;
  }

  getAllThemes(): ThemeConfig[] {
    return Array.from(this.themes.values());
  }

  createCustomTheme(
    assessmentId: string,
    name: string,
    colors: Partial<ThemeConfig['colors']>
  ): ThemeConfig {
    const baseTheme = this.getTheme(assessmentId);
    const customTheme: ThemeConfig = {
      id: assessmentId,
      name,
      colors: { ...baseTheme.colors, ...colors },
      gradients: baseTheme.gradients,
      shadows: baseTheme.shadows
    };

    this.themes.set(assessmentId, customTheme);
    return customTheme;
  }

  getContrastColor(assessmentId: string, backgroundColor: string): string {
    const color = backgroundColor.replace('#', '');
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 128 ? '#000000' : '#FFFFFF';
  }

  getGradient(assessmentId: string, gradientKey: 'primary' | 'secondary'): string {
    const theme = this.getTheme(assessmentId);
    return theme.gradients?.[gradientKey] || theme.colors.primary;
  }
}

export const themeEngine = new ThemeEngine();

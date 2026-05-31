import { Question } from '../../types';

export interface AssessmentLayoutConfig {
  assessmentId: string;
  layoutType: 'card' | 'timeline' | 'grid' | 'custom';
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  questionDisplay: 'single' | 'batch' | 'all';
  navigationStyle: 'vertical' | 'horizontal' | 'floating';
  progressIndicator: 'bar' | 'dots' | 'steps';
  feedbackStyle: 'immediate' | 'end' | 'adaptive';
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  gradients?: {
    primary: string;
    secondary: string;
  };
  shadows?: {
    sm: string;
    md: string;
    lg: string;
  };
}

export interface LayoutRenderContext {
  questions: Question[];
  currentIndex: number;
  totalQuestions: number;
  assessmentId: string;
  onAnswer: (questionId: string, answer: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
}

export interface ProgressData {
  current: number;
  total: number;
  percentage: number;
  label: string;
}

export interface NavigationData {
  canGoBack: boolean;
  canGoNext: boolean;
  canSubmit: boolean;
  currentStep: number;
  totalSteps: number;
}

export interface RenderResult {
  layout: AssessmentLayoutConfig;
  questions: Question[];
  currentQuestion: Question;
  progress: ProgressData;
  navigation: NavigationData;
  theme: ThemeConfig;
}

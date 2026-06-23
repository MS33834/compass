// 指南 · Zustand 全局状态
//
// 持久化键：compass-v2（版本号便于迁移）
// 持久化字段：answers + locale + theme + 进度（phase / domain / currentIndex）
// 报告（report）不入盘：可由 answers + domain 在映照页重新计算
// 故：刷新可在原页面继续；清空则通过 reset() 主动清 localStorage

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DOMAINS } from './domain/figures/domains';
import type { DomainId } from './domain/figures/figure.types';
import type { MatchReport } from './domain/matching/report';
import type { ExportShape } from './share';

type Phase = 'prologue' | 'path' | 'way' | 'reflection';

// localStorage 写入保护：配额溢出时静默降级，避免整站崩溃
const safeLocalStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch (e) {
      // QuotaExceededError 等静默降级，用户仍可继续使用当前会话
      console.warn('Compass: failed to persist state', e);
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* noop */
    }
  },
};
type Locale = 'zh' | 'en';
type Theme = 'light' | 'dark';

type State = {
  phase: Phase;
  domain: DomainId | null;
  answers: Record<string, number>;
  currentIndex: number;
  locale: Locale;
  theme: Theme;
  report: MatchReport | null;
  version: number; // 用于数据迁移
  viewingFigure: string | null; // 当前查看的人物详情 id
};

type Actions = {
  goPhase: (p: Phase) => void;
  selectDomain: (d: DomainId) => void;
  answer: (itemId: string, optIdx: number) => void;
  goPrev: () => void;
  goNext: () => void;
  clampIndex: (maxIndex: number) => void;
  setReport: (r: MatchReport) => void;
  reset: () => void;
  setLocale: (l: Locale) => void;
  setTheme: (th: Theme) => void;
  importState: (s: ExportShape) => void;
  viewFigure: (id: string | null) => void;
};

const STORAGE_KEY = 'compass-v2';
const CURRENT_VERSION = 2;

const detectInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem(`${STORAGE_KEY}.theme`);
  if (saved === 'light' || saved === 'dark') return saved;
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
};

const applyTheme = (th: Theme) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', th);
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

// 数据迁移与校验
const migrateState = (persistedState: unknown): State => {
  const fallback: State = {
    phase: 'prologue',
    domain: null,
    answers: {},
    currentIndex: 0,
    locale: 'en',
    theme: 'light',
    report: null,
    version: CURRENT_VERSION,
    viewingFigure: null,
  };
  if (!isRecord(persistedState)) return fallback;

  // 校验 answers 为普通对象
  const rawAnswers = persistedState.answers;
  const answers: Record<string, number> = {};
  if (isRecord(rawAnswers)) {
    for (const [k, v] of Object.entries(rawAnswers)) {
      if (typeof v === 'number' && Number.isFinite(v)) answers[k] = v;
    }
  }

  // 校验 theme 枚举
  const theme: Theme = persistedState.theme === 'dark' ? 'dark' : 'light';

  // 校验 locale 枚举
  const locale: Locale = persistedState.locale === 'zh' ? 'zh' : 'en';

  // 校验 currentIndex 非负整数
  const rawIdx = persistedState.currentIndex;
  const currentIndex =
    typeof rawIdx === 'number' && Number.isInteger(rawIdx) && rawIdx >= 0 && rawIdx < 1000
      ? rawIdx
      : 0;

  // 校验 domain 枚举
  const rawDomain = persistedState.domain;
  const domain =
    typeof rawDomain === 'string' && (DOMAINS as readonly string[]).includes(rawDomain)
      ? (rawDomain as DomainId)
      : null;

  return {
    ...fallback,
    ...persistedState,
    answers,
    theme,
    locale,
    currentIndex,
    domain,
    version: CURRENT_VERSION,
  };
};

export const useStore = create<State & Actions>()(
  persist(
    set => ({
      phase: 'prologue',
      domain: null,
      answers: {},
      currentIndex: 0,
      locale: 'en',
      theme: detectInitialTheme(),
      report: null,
      version: CURRENT_VERSION,
      viewingFigure: null,

      goPhase: (p: Phase) => set({ phase: p }),
      selectDomain: (d: DomainId) =>
        set({ domain: d, phase: 'way', currentIndex: 0, answers: {}, report: null }),
      answer: (itemId: string, optIdx: number) =>
        set((s: State & Actions) => ({
          answers: { ...s.answers, [itemId]: optIdx },
        })),
      goPrev: () =>
        set((s: State & Actions) => ({ currentIndex: Math.max(0, s.currentIndex - 1) })),
      goNext: () => set((s: State & Actions) => ({ currentIndex: s.currentIndex + 1 })),
      clampIndex: (maxIndex: number) =>
        set((s: State & Actions) => ({
          currentIndex: Math.max(0, Math.min(s.currentIndex, maxIndex)),
        })),
      setReport: (r: MatchReport) => set({ report: r, phase: 'reflection' }),
      reset: () =>
        set({
          answers: {},
          currentIndex: 0,
          report: null,
          phase: 'prologue',
          domain: null,
          viewingFigure: null,
        }),
      setLocale: (l: Locale) => {
        if (typeof document !== 'undefined') document.documentElement.lang = l;
        set({ locale: l });
      },
      setTheme: (th: Theme) => {
        applyTheme(th);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(`${STORAGE_KEY}.theme`, th);
        }
        set({ theme: th });
      },
      importState: (s: ExportShape) => {
        applyTheme(s.theme);
        if (typeof document !== 'undefined') document.documentElement.lang = s.locale;
        set({
          answers: s.answers,
          domain: s.domain,
          currentIndex: s.currentIndex,
          locale: s.locale,
          theme: s.theme,
          phase: s.domain && Object.keys(s.answers).length > 0 ? 'way' : 'prologue',
          report: null,
          viewingFigure: null,
        });
      },
      viewFigure: (id: string | null) => set({ viewingFigure: id }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (s: State & Actions) => ({
        answers: s.answers,
        locale: s.locale,
        theme: s.theme,
        phase: s.phase,
        domain: s.domain,
        currentIndex: s.currentIndex,
        version: s.version,
      }),
      onRehydrateStorage: () => (s, error) => {
        if (error) {
          console.error('Failed to rehydrate state:', error);
          return;
        }
        // merge 已完成迁移，此处仅需应用主题与语言
        if (s) {
          applyTheme(s.theme);
          if (typeof document !== 'undefined') document.documentElement.lang = s.locale;
        }
      },
      merge: (persistedState, currentState) => {
        // 合并时执行迁移
        const migrated = migrateState(persistedState);
        return { ...currentState, ...migrated };
      },
    }
  )
);

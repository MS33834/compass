// 镜心 · Zustand 全局状态

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DomainId } from './domain/figures/figure.types';
import type { MatchReport } from './domain/matching/report';

type Phase = 'prologue' | 'path' | 'way' | 'reflection';

type Locale = 'zh' | 'en';

type State = {
  phase: Phase;
  domain: DomainId | null;
  answers: Record<string, number>;
  currentIndex: number;
  locale: Locale;
  report: MatchReport | null;
};

type Actions = {
  goPhase: (p: Phase) => void;
  selectDomain: (d: DomainId) => void;
  answer: (itemId: string, optIdx: number) => void;
  goPrev: () => void;
  goNext: () => void;
  setReport: (r: MatchReport) => void;
  reset: () => void;
  setLocale: (l: Locale) => void;
};

const STORAGE_KEY = 'jingxin-v1';

export const useStore = create<State & Actions>()(
  persist(
    set => ({
      phase: 'prologue',
      domain: null,
      answers: {},
      currentIndex: 0,
      locale: 'zh',
      report: null,

      goPhase: p => set({ phase: p }),
      selectDomain: d => set({ domain: d, phase: 'way', currentIndex: 0 }),
      answer: (itemId, optIdx) => set(s => ({ answers: { ...s.answers, [itemId]: optIdx } })),
      goPrev: () => set(s => ({ currentIndex: Math.max(0, s.currentIndex - 1) })),
      goNext: () => set(s => ({ currentIndex: s.currentIndex + 1 })),
      setReport: r => set({ report: r, phase: 'reflection' }),
      reset: () =>
        set({ answers: {}, currentIndex: 0, report: null, phase: 'prologue', domain: null }),
      setLocale: l => set({ locale: l }),
    }),
    {
      name: STORAGE_KEY,
      partialize: s => ({ answers: s.answers, locale: s.locale }),
    }
  )
);

// 指南 · 英文 UI 字典
// 典雅英译，与中文半文言语调相配

import type { Dict } from './zh';

// 显式声明为 Dict 类型（不依赖 typeof 推导，让字符串可自由翻译）
export const en: Dict = {
  ui: {
    appName: 'Compass',
    sealChar: '指',
    returnHome: 'Home',
    returnHomeConfirm: 'Return to home will clear all answers. Continue?',
    resetConfirm: 'Starting over will clear all answers. Continue?',
    confirmYes: 'Continue',
    confirmNo: 'Cancel',
    toggleLang: '中文',
    langLabelZh: '切换至中文',
    langLabelEn: 'Switch to English',
    skipToContent: 'Skip to content',
    themeLight: '☼',
    themeDark: '☾',
    themeLabelLight: 'Switch to light theme',
    themeLabelDark: 'Switch to dark theme',
    loading: 'Reflecting…',
    phase: {
      prologue: 'Entry',
      path: 'Domain',
      way: 'Inquiry',
      reflection: 'Reflection',
    },
  },
  prologue: {
    title: 'Compass',
    seal: '指',
    enter: 'Begin',
    privacy: 'Your answers stay on your device. Compass never goes online.',
    verses: [
      [
        { text: 'Compass', gloss: 'A quiet compass for the inner self.' },
        {
          text: 'Among three thousand years, who might sit with thee?',
          gloss: 'Answer in form, in spirit, in a parallel resonance of time.',
        },
      ],
      [
        {
          text: 'Three thousand years live within',
          gloss: 'Seek not without; thy answer is the bearing.',
        },
        {
          text: 'Their shadow is not thou, yet not-not-thou.',
          gloss: 'Ask: if thou wert he, how wouldst thou live?',
        },
      ],
      [
        { text: 'Begin', gloss: 'Three minutes, three millennia.' },
        {
          text: 'Borrow the shadows of the ancients to bear one thought of thine.',
          gloss: 'No right or wrong — only sincerity.',
        },
      ],
    ],
  },
  path: {
    title: 'Choose Domain',
    prompt: 'Whither wouldst thou go?',
    region: { east: 'East', west: 'West' },
    domains: {
      'east-literati': { name: 'Literati', sub: 'Poets, lyricists, essayists, thinkers' },
      'east-statesman': {
        name: 'Statesmen',
        sub: 'Chancellors, generals, reformers, loyal hearts',
      },
      'east-scientist': { name: 'Scientists', sub: 'Astronomy, math, medicine, engineering' },
      'west-philosopher': {
        name: 'Philosophers',
        sub: 'Greek, continental, Anglo-American thought',
      },
      'west-scientist': {
        name: 'Scientists',
        sub: 'Founders of modern science',
      },
    },
    start: 'Begin',
    pending: 'Forthcoming',
    picked: 'Once chosen, walk into its questions.',
    selected: 'Picked',
    peopleCount: (n: number) => `${n} figures`,
  },
  way: {
    question: (n: number, total: number) => `Question ${n} / ${total}`,
    answered: (n: number, total: number) => `Answered ${n} / ${total}`,
    optionsLabel: 'Options',
    prev: 'Back',
    next: 'Next',
    skip: 'Skip',
    skipThis: 'Skip this',
    finish: 'Reveal',
    finishTitle: (n: number) => `Answer ${n} more to reveal`,
    backtrackHint: 'Some questions ahead remain unanswered — go back with ←',
    keyboardHint: 'Keyboard: ← → navigate · 1-6 select · Enter confirm',
    resetLabel: '· Clear & Restart ·',
  },
  reflection: {
    sealLabel: 'THY COMPASS',
    score: (pct: number) => `Affinity ${pct}%`,
    samePath: 'Kindred Spirits',
    twelve: 'Twelve Vectors',
    rowFormat: (user: string, fig: string, comment: string) =>
      `Thou ${user} · Ancient ${fig} ——${comment}`,
    changeDomain: 'Change Domain',
    reset: 'Begin Anew',
    lowConfidence:
      '(Few answers given — this is but a faint bearing. Answer more for a clearer compass.)',
    confidenceHint: (pct: number) => `Confidence ~${pct}% · Early answers, compass still forming`,
    mostSimilar: 'Closest',
    youExceed: 'You exceed',
    youFallShort: 'You fall short',
    youMatch: 'Matched',
    traitLabels: { same: 'Same', close: 'Close', diverge: 'Diverge' },
    chartLabels: { you: 'You', ancient: 'Ancient' },
    share: 'Share Compass',
    exportJSON: 'Export JSON',
    importJSON: 'Import JSON',
    copyResume: 'Copy Resume Link',
    anecdote: 'Brief Life',
    shareCopied: 'Copied',
    imported: 'Imported',
    importFail: 'Import failed: invalid file',
  },
  figureDetail: {
    era: 'Era',
    domain: 'Domain',
    signature: 'Their Words',
    bio: 'Life',
    anecdotes: 'Anecdotes',
    related: 'Kindred Lights',
    close: 'Back',
    startQuiz: 'Take this domain',
  },
  shareCard: {
    title: 'Share Card',
    download: 'Download Image',
    share: 'System Share',
    close: 'Close',
    rendering: 'Rendering…',
    renderError: 'Rendering failed. Please close and try again.',
    alt: (name: string) => `Compass share card: ${name}`,
  },
  share: {
    title: 'A quiet compass for the inner self',
    text: 'I took a bearing — come take one too.',
  },
};

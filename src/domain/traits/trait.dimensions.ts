// 镜心 · 12 维特征空间元信息
//
// 设计原则：12 维正交、连续、可解释
// 思辨/行动/意志/处世 高权重（人格主干）
// 审美/时间/表达 低权重（个人化）

import type { TraitMeta } from './trait.types';

export const TRAITS: readonly TraitMeta[] = [
  { id: 1, name: '思辨', glyph: '思', weight: 1.0, lo: '务实', hi: '形而上' },
  { id: 2, name: '情感', glyph: '情', weight: 0.9, lo: '克制', hi: '外露' },
  { id: 3, name: '行动', glyph: '行', weight: 1.1, lo: '沉思', hi: '果决' },
  { id: 4, name: '革新', glyph: '革', weight: 1.0, lo: '守成', hi: '突破' },
  { id: 5, name: '群我', glyph: '群', weight: 0.8, lo: '自我', hi: '群体' },
  { id: 6, name: '审美', glyph: '韵', weight: 0.7, lo: '理性', hi: '感性' },
  { id: 7, name: '意志', glyph: '毅', weight: 1.0, lo: '随顺', hi: '刚毅' },
  { id: 8, name: '学识', glyph: '学', weight: 0.9, lo: '通识', hi: '专精' },
  { id: 9, name: '处世', glyph: '世', weight: 1.0, lo: '进取', hi: '内省' },
  { id: 10, name: '时间', glyph: '时', weight: 0.7, lo: '当下', hi: '永恒' },
  { id: 11, name: '风险', glyph: '险', weight: 1.0, lo: '求稳', hi: '敢赌' },
  { id: 12, name: '表达', glyph: '辞', weight: 0.8, lo: '平实', hi: '华美' },
] as const;

export const TRAIT_COUNT = TRAITS.length;

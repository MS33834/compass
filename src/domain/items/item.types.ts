// 指南 · 题库数据契约

import type { TraitId } from '../traits/trait.types';

export type ItemFormat = 'situational' | 'ranking' | 'imagery' | 'aesthetic';

export type ItemOption = {
  /** 文言短句（4-8 字） */
  text: string;
  /** 白话注解（10-30 字） */
  gloss: string;
  /** 主维度贡献 */
  primary: { traitId: TraitId; delta: number };
  /** 副维度小幅加减 */
  secondary?: { traitId: TraitId; delta: number }[];
};

export type Item = {
  id: string;
  format: ItemFormat;
  prompt: string;
  promptGloss?: string;
  options: [ItemOption, ItemOption, ItemOption, ItemOption, ItemOption, ItemOption];
};

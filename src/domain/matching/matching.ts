// 镜心 · Top-N 匹配
//
// 排序策略：
// 1. 按主相似度降序排列
// 2. 差异小于 0.01 视为"难分轩轾"—— 调用 breakTie 进入精细仲裁
//    —— 先看余弦形态匹配，再看最大单维差异，最后看均值差
// 3. 彻底平手时用 id 字典序保底

import { similarity, breakTie } from './scoring';
import type { TraitVector } from '../traits/trait.types';
import type { Figure } from '../figures/figure.types';

export type RankedFigure = { figure: Figure; score: number };

const TIE_THRESHOLD = 0.01;

export function topN(user: TraitVector, pool: readonly Figure[], n = 5): RankedFigure[] {
  return pool
    .map(f => ({ figure: f, score: similarity(user, f.vector) }))
    .sort((a, b) => {
      const diff = b.score - a.score;
      if (Math.abs(diff) > TIE_THRESHOLD) return diff > 0 ? 1 : -1;
      // 进入精细仲裁
      const tb = breakTie(user, a.figure.vector, b.figure.vector, 0.005);
      if (tb !== 0) return tb;
      // 彻底平手：按 id 字典序保底
      return a.figure.id.localeCompare(b.figure.id);
    })
    .slice(0, n);
}

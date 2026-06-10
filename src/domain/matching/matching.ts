// 镜心 · Top-N 匹配

import { similarity } from './scoring';
import type { TraitVector } from '../traits/trait.types';
import type { Figure } from '../figures/figure.types';

export type RankedFigure = { figure: Figure; score: number };

export function topN(user: TraitVector, pool: readonly Figure[], n = 5): RankedFigure[] {
  return pool
    .map(f => ({ figure: f, score: similarity(user, f.vector) }))
    .sort((a, b) => b.score - a.score || a.figure.id.localeCompare(b.figure.id))
    .slice(0, n);
}

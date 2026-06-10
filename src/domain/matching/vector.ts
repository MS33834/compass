// 镜心 · 答题 → 12 维向量

import type { TraitVector } from '../traits/trait.types';
import type { Item } from '../items/item.types';

/** 把答题记录压成 12 维特征向量 */
export function computeUserVector(
  answers: Record<string, number>,
  pool: readonly Item[]
): TraitVector {
  const raw = new Array(12).fill(0);
  const coverage = new Array(12).fill(0);

  for (const item of pool) {
    const optIdx = answers[item.id];
    if (optIdx === undefined) continue;
    const opt = item.options[optIdx];
    if (!opt) continue;

    raw[opt.primary.traitId - 1] += opt.primary.delta;
    coverage[opt.primary.traitId - 1] += 1;
    for (const s of opt.secondary ?? []) {
      raw[s.traitId - 1] += s.delta;
    }
  }

  return raw.map((s, i) => {
    if (coverage[i] === 0) return 0.5;
    const mean = s / coverage[i];
    return 1 / (1 + Math.exp(-mean * 2.5));
  }) as TraitVector;
}

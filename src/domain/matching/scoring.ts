// 镜心 · 匹配算法 · 加权欧氏 + 余弦调和

import { TRAITS } from '../traits/trait.dimensions';
import type { TraitVector } from '../traits/trait.types';

const SQRT_12 = Math.sqrt(12);

function weightedEuclid(a: TraitVector, b: TraitVector): number {
  let sq = 0;
  for (let i = 0; i < 12; i++) {
    const d = a[i] - b[i];
    sq += TRAITS[i].weight * d * d;
  }
  return Math.sqrt(sq);
}

function cosine(a: TraitVector, b: TraitVector): number {
  let dot = 0,
    nA = 0,
    nB = 0;
  for (let i = 0; i < 12; i++) {
    dot += a[i] * b[i];
    nA += a[i] * a[i];
    nB += b[i] * b[i];
  }
  const denom = Math.sqrt(nA) * Math.sqrt(nB);
  return denom === 0 ? 0 : dot / denom;
}

/** 综合相似度 ∈ [0, 1] */
export function similarity(user: TraitVector, fig: TraitVector): number {
  const e = weightedEuclid(user, fig) / SQRT_12;
  const c = cosine(user, fig);
  return 0.6 * (1 - e) + 0.4 * c;
}

// 镜心 · 匹配算法 · 加权欧氏 + 余弦 + 方向一致性的三重调和
//
// 设计要点：
// 1. weightedEuclid：距离空间 —— 直接衡量 12 维值的接近程度
// 2. cosine：形态空间 —— 衡量整体倾向形态（高/低维的"形状"匹配）
// 3. shapeAgreement：方向空间 —— 逐维与均值偏差的同向比例（看重"是否偏向同一侧"）
// 4. 三信号加权组合，输出统一 [0, 1] 相似度
// 5. topN 排序：主相似度差异 ≥ 0.01 直接排序，否则进入 tie-break
//    tie-break 先看形态余弦，再看最大维度差异（避免某人"有一项特别悬殊"被并列第一）

import { TRAITS } from '../traits/trait.dimensions';
import type { TraitVector } from '../traits/trait.types';

// 权重总和的平方根，用于归一化加权欧氏距离
const WEIGHT_SUM = TRAITS.reduce((s, t) => s + t.weight, 0);
const SQRT_WEIGHT_SUM = Math.sqrt(WEIGHT_SUM);
const EPSILON = 1e-6;

function weightedEuclid(a: TraitVector, b: TraitVector): number {
  let sq = 0;
  for (let i = 0; i < 12; i++) {
    const d = a[i] - b[i];
    sq += TRAITS[i].weight * d * d;
  }
  return Math.sqrt(sq);
}

function cosine(a: TraitVector, b: TraitVector): number {
  let dot = 0;
  let nA = 0;
  let nB = 0;
  for (let i = 0; i < 12; i++) {
    dot += a[i] * b[i];
    nA += a[i] * a[i];
    nB += b[i] * b[i];
  }
  const denom = Math.sqrt(nA) * Math.sqrt(nB);
  if (denom < EPSILON) return 0.5;
  return Math.max(-1, Math.min(1, dot / denom));
}

/** 方向一致性：衡量逐维与各自均值偏离的同向比例 */
function shapeAgreement(a: TraitVector, b: TraitVector): number {
  const meanA = a.reduce((s, v) => s + v, 0) / 12;
  const meanB = b.reduce((s, v) => s + v, 0) / 12;
  let agree = 0;
  for (let i = 0; i < 12; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    if (da * db > 0) {
      // 同向偏离（都高于或都低于各自均值）
      agree += 1;
    } else if (Math.abs(da) < 0.05 && Math.abs(db) < 0.05) {
      // 两者都接近均值 —— 方向一致（同为中性），计满分
      agree += 1;
    }
  }
  return agree / 12;
}

/** 综合相似度 ∈ [0, 1]：距离 0.45 + 余弦 0.35 + 形态 0.2 */
export function similarity(user: TraitVector, fig: TraitVector): number {
  const e = weightedEuclid(user, fig) / SQRT_WEIGHT_SUM;
  const c = cosine(user, fig);
  const shape = shapeAgreement(user, fig);
  return 0.45 * (1 - e) + 0.35 * c + 0.2 * shape;
}

/** 计算两个向量的逐维差异绝对值 */
export function dimensionDifferences(user: TraitVector, fig: TraitVector): number[] {
  return user.map((u, i) => Math.abs(u - fig[i]));
}

/** 平局检测：主相似度差异 < 阈值时，先看余弦形态、再看最大单维差异 */
export function breakTie(
  user: TraitVector,
  fig1: TraitVector,
  fig2: TraitVector,
  threshold: number = 0.01
): number {
  const sim1 = similarity(user, fig1);
  const sim2 = similarity(user, fig2);

  if (Math.abs(sim1 - sim2) > threshold) {
    return sim1 > sim2 ? -1 : 1;
  }

  // 第一层 tie-break：余弦相似度（形态匹配优先）
  const c1 = cosine(user, fig1);
  const c2 = cosine(user, fig2);
  if (Math.abs(c1 - c2) > 0.005) {
    return c1 > c2 ? -1 : 1;
  }

  // 第二层 tie-break：最大单维差异越小越好（避免"有一项特别离谱"）
  const diffs1 = dimensionDifferences(user, fig1);
  const diffs2 = dimensionDifferences(user, fig2);
  const max1 = Math.max(...diffs1);
  const max2 = Math.max(...diffs2);
  if (Math.abs(max1 - max2) > 0.005) {
    return max1 - max2;
  }

  // 最终 tie-break：平均差异
  const avg1 = diffs1.reduce((a, b) => a + b, 0) / 12;
  const avg2 = diffs2.reduce((a, b) => a + b, 0) / 12;
  return avg1 - avg2;
}

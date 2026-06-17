// 镜心 · 置信度
//
// 综合四个维度：
// 1. 完成度：已答题占比，线性增长到 100% 才饱和（60% 仅得 0.6，避免过早自信）
// 2. 决断度：12 维分布的方差 —— 若所有维都挤在 0.5 = 无倾向 = 低决断
// 3. 一致性：同一维度多题的回答是否同向（内部逻辑是否一贯）
// 4. 平衡惩罚：若用户向量的 12 维全偏高或全偏低是不合理
//
// 输出：[0, 1]，越高越可信

import { computeUserVector } from './vector';
import type { Item } from '../items/item.types';

export function confidence(answers: Record<string, number>, pool: readonly Item[]): number {
  const answered = Object.keys(answers).length;
  const total = pool.length;

  // 1. 完成度：线性增长，100% 答题才饱和
  const completeness = total > 0 ? Math.min(1, answered / total) : 0;

  // 2. 决断度：
  const user = computeUserVector(answers, pool);
  const mean = user.reduce((s, v) => s + v, 0) / 12;
  const variance = user.reduce((s, v) => s + (v - mean) ** 2, 0) / 12;
  // 0.02 以上视为有明显倾向（对应 ~±0.14 偏离）
  const decisiveness = Math.min(1, variance / 0.025);

  // 3. 一致性：逐维答案的方向一致性
  const dimensionRaw = new Array(12).fill(null).map(() => [] as number[]);
  const dimensionSign = new Array(12).fill(null).map(() => [] as number[]);

  for (const item of pool) {
    const optIdx = answers[item.id];
    if (optIdx === undefined) continue;
    const opt = item.options[optIdx];
    if (!opt) continue;

    dimensionRaw[opt.primary.traitId - 1].push(opt.primary.delta);
    dimensionSign[opt.primary.traitId - 1].push(opt.primary.delta);
    for (const s of opt.secondary ?? []) {
      dimensionRaw[s.traitId - 1].push(s.delta);
    }
  }

  let consistencySum = 0;
  let consistencyCount = 0;

  for (let i = 0; i < 12; i++) {
    const dimAns = dimensionRaw[i];
    if (dimAns.length < 2) continue;

    // 3a. 方向一致性（正负号的同正或同负比例）
    let positive = 0;
    let negative = 0;
    for (const v of dimAns) {
      if (v > 0.1) positive++;
      else if (v < -0.1) negative++;
    }
    const nonzero = positive + negative;
    const signConsistency = nonzero > 0 ? Math.max(positive, negative) / nonzero : 0.5;

    // 3b. 值一致性（标准差越小越一致）
    const avg = dimAns.reduce((s, v) => s + v, 0) / dimAns.length;
    const std = Math.sqrt(dimAns.reduce((s, v) => s + (v - avg) ** 2, 0) / dimAns.length);
    const valueConsistency = Math.max(0, 1 - std / 1.5);

    // 方向 0.6 + 值 0.4
    consistencySum += 0.6 * signConsistency + 0.4 * valueConsistency;
    consistencyCount++;
  }

  const consistency = consistencyCount > 0 ? consistencySum / consistencyCount : 0.5;

  // 4. 极值平衡性：避免所有维全高或全低
  // —— 极端偏差的情况我们惩罚（正常人应该是有些维高有些维低）
  // 衡量：分布的偏斜（skew 的程度）
  let skew = 0;
  for (let i = 0; i < 12; i++) {
    const d = user[i] - mean;
    skew += d * d * d;
  }
  skew = skew / 12; // 三阶矩
  const balance = Math.max(0, 1 - Math.abs(skew) * 25);

  // 综合（完成度 0.45 + 决断度 0.25 + 一致性 0.20 + 平衡性 0.10）
  const raw = 0.45 * completeness + 0.25 * decisiveness + 0.2 * consistency + 0.1 * balance;

  // 若答题极少（< 5），直接给低值，避免误导
  if (answered < 5) return Math.min(0.3, raw);

  return Math.max(0, Math.min(1, raw));
}

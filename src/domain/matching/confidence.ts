// 指南 · 置信度（v2）
//
// 综合五个维度：
// 1. 完成度：已答题占比，线性增长到 100% 才饱和
// 2. 决断度：12 维分布的方差 —— 若所有维都挤在 0.5 = 无倾向 = 低决断
// 3. 一致性：同一维度多题的回答是否同向
// 4. 回答时间考量（可选）：< 1 秒快速作答 → 降低该题权重
// 5. 极端倾向检测：一直选最极端选项（delta ±1.2~1.5）→ 降低置信度
// 6. 火山型平衡惩罚：偏离 0.5 太多或太少都要惩罚（中间最优）
//
// 输出：[0, 1]，越高越可信

import { computeUserVector } from './vector';
import type { Item } from '../items/item.types';

export interface ConfidenceOptions {
  /**
   * 每道题的作答时间（毫秒），key = item.id，value = 毫秒数。
   * 可选。不传则忽略时间考量，保持向后兼容。
   */
  responseTimes?: Record<string, number>;
}

export function confidence(
  answers: Record<string, number>,
  pool: readonly Item[],
  options?: ConfidenceOptions
): number {
  const { responseTimes } = options ?? {};
  const answered = Object.keys(answers).length;
  const total = pool.length;

  // 1. 完成度：线性增长，100% 答题才饱和
  const completeness = total > 0 ? Math.min(1, answered / total) : 0;

  // 2. 决断度
  const user = computeUserVector(answers, pool);
  const mean = user.reduce((s, v) => s + v, 0) / 12;
  const variance = user.reduce((s, v) => s + (v - mean) ** 2, 0) / 12;
  const decisiveness = Math.min(1, variance / 0.025);

  // 3. 一致性：逐维答案的方向一致性
  const dimensionRaw = new Map<number, number[]>();
  const dimensionTime = new Map<number, number[]>();

  for (const item of pool) {
    const optIdx = answers[item.id];
    if (optIdx === undefined) continue;
    const opt = item.options[optIdx];
    if (!opt) continue;

    const time = responseTimes?.[item.id];

    const push = (traitId: number, delta: number, t?: number) => {
      const raw = dimensionRaw.get(traitId);
      if (raw) raw.push(delta);
      else dimensionRaw.set(traitId, [delta]);

      if (t !== undefined) {
        const times = dimensionTime.get(traitId);
        if (times) times.push(t);
        else dimensionTime.set(traitId, [t]);
      }
    };
    push(opt.primary.traitId, opt.primary.delta, time);
    for (const s of opt.secondary ?? []) push(s.traitId, s.delta);
  }

  let consistencySum = 0;
  let consistencyCount = 0;
  let timePenaltySum = 0;
  let timePenaltyCount = 0;

  for (const [traitId, dimAns] of dimensionRaw) {
    if (dimAns.length < 2) continue;

    // 3a. 方向一致性
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

    consistencySum += 0.6 * signConsistency + 0.4 * valueConsistency;
    consistencyCount++;

    // 4. 回答时间考量：快速作答（< 1000ms）降低该维度权重
    if (responseTimes) {
      const times = dimensionTime.get(traitId);
      if (times) {
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        // < 800ms → 该维度置信度降 30%
        const timeWeight = avgTime < 800 ? 0.7 : 1.0;
        timePenaltySum += timeWeight;
        timePenaltyCount++;
      }
    }
  }

  const consistency = consistencyCount > 0 ? consistencySum / consistencyCount : 0.5;
  const timeFactor = timePenaltyCount > 0 ? timePenaltySum / timePenaltyCount : 1.0;

  // 5. 极端倾向检测
  let extremeCount = 0;
  let extremeTotal = 0;
  for (const dimAns of dimensionRaw.values()) {
    for (const v of dimAns) {
      extremeTotal++;
      if (Math.abs(v) >= 1.2) extremeCount++;
    }
  }
  const extremeRatio = extremeTotal > 0 ? extremeCount / extremeTotal : 0;
  // 全是极端选项 → 惩罚 20%
  const extremePenalty = Math.max(0.8, 1.0 - extremeRatio * 0.2);

  // 6. 火山型平衡惩罚：偏离 0.5 太多或太少都要惩罚
  // f(x) = 1 - 4*(x - 0.5)^2
  // 在 x=0.5 时最大（1.0），x=0 或 x=1 时最小（0）
  const balance = Math.max(0, 1 - 4 * (mean - 0.5) * (mean - 0.5));

  // 综合（完成度 0.40 + 决断度 0.20 + 一致性 0.20 + 平衡性 0.10 + 时间 0.05 + 极端惩罚 0.05）
  const raw =
    0.40 * completeness +
    0.20 * decisiveness +
    0.20 * consistency +
    0.10 * balance +
    0.05 * timeFactor +
    0.05 * extremePenalty;

  // 若答题极少（< 5），直接给低值，避免误导
  if (answered < 5) return Math.min(0.3, raw);

  return Math.max(0, Math.min(1, raw));
}

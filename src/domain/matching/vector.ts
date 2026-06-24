// 指南 · 答题 → 12 维特征向量
//
// 算法说明（三层加权）：
// 1. 主维度 delta 直接累积（权重 1.0）
// 2. 副维度 delta 累积（权重 0.35，用于"旁敲侧击"的微弱牵引）
// 3. 未覆盖维度用"已答题均值 + 全局中性 0.5"的加权混合（覆盖率越低越倾向 0.5）
// 4. 最终通过自适应 sigmoid 映射到 [0.08, 0.92]
//    ——覆盖度高 → K 大 → 分布更展开；覆盖度低 → K 小 → 收敛到中性

import type { TraitVector } from '../traits/trait.types';
import type { Item } from '../items/item.types';

const PRIMARY_WEIGHT = 1.0;
const SECONDARY_WEIGHT = 0.35;

export function computeUserVector(
  answers: Record<string, number>,
  pool: readonly Item[]
): TraitVector {
  const raw = new Array(12).fill(0);
  const coverage = new Array(12).fill(0);
  const secondaryCoverage = new Array(12).fill(0);
  const answeredCount = Object.keys(answers).length;
  const totalItems = pool.length;

  // 第一遍：收集所有已答题项的原始分数
  for (const item of pool) {
    const optIdx = answers[item.id];
    if (optIdx === undefined) continue;
    const opt = item.options[optIdx];
    if (!opt) continue;

    raw[opt.primary.traitId - 1] += opt.primary.delta * PRIMARY_WEIGHT;
    coverage[opt.primary.traitId - 1] += 1;
    for (const s of opt.secondary ?? []) {
      raw[s.traitId - 1] += s.delta * SECONDARY_WEIGHT;
      secondaryCoverage[s.traitId - 1] += 1;
    }
  }

  // 计算全局均值：用于未覆盖维度的"合理猜测"
  let globalMean = 0;
  let globalCovered = 0;
  for (let i = 0; i < 12; i++) {
    if (coverage[i] > 0) {
      globalMean += raw[i] / coverage[i];
      globalCovered += 1;
    }
  }
  globalMean = globalCovered > 0 ? globalMean / globalCovered : 0;

  // 整体答题比例：越低越收敛到中性
  const answerRatio = totalItems > 0 ? answeredCount / totalItems : 0;
  // 未答题时统一收敛强度，避免 floor/ceil 与 pullToNeutral 双重收敛导致过度中性化
  const neutralPull = Math.max(0.5, 1 - answerRatio);

  // 第二遍：逐维归一化
  return raw.map((s, i) => {
    const cov = coverage[i];

    if (cov === 0) {
      // 本维未被主维度覆盖 → 用副维度信号 + 全局均值混合
      const secondarySignal = secondaryCoverage[i] > 0 ? s / secondaryCoverage[i] : globalMean;
      const blended = secondarySignal * 0.5 + globalMean * 0.5;
      return 0.5 + (1 / (1 + Math.exp(-blended * 1.5)) - 0.5) * (1 - neutralPull);
    }

    const mean = s / cov;

    // 自适应 sigmoid 系数：
    // - 本维覆盖度越高，K 越大（区分度越高）
    // - 整体答题比例越高，基础 K 越大（越相信用户的倾向）
    const baseK = 1.5 + answerRatio * 1.5;
    const perTraitBoost = Math.min(2.0, (cov / Math.max(1, answeredCount)) * 3.0);
    const adaptiveK = baseK + perTraitBoost;

    const sigmoid = 1 / (1 + Math.exp(-mean * adaptiveK));

    // 边界处理：保留"余量"以体现不确定性，但不再随 answerRatio 双重收敛
    return Math.max(0.08, Math.min(0.92, sigmoid));
  }) as TraitVector;
}

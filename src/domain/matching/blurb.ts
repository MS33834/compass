// 指南 · 解读模板
//
// 每个特征维度有 3 段：
//   lo：用户偏低（与古人差距 < -0.15）
//   mid：用户中位（差距 ≤ 0.15）
//   hi：用户偏高（差距 > 0.15）
//
// 占位符：{{name}} 古人名；{{era}} 时代

import { TRAITS } from '../traits/trait.dimensions';
import type { TraitVector } from '../traits/trait.types';

export const BLURB: Record<number, { lo: string; mid: string; hi: string }> = {
  1: {
    lo: '汝与 {{name}} 同，行事不滞于玄谈，握今即握道。',
    mid: '汝与 {{name}} 之思，半在云端半在泥，各有归处。',
    hi: '汝所求者形而上，{{name}} 之所求亦然，且求之更深。',
  },
  2: {
    lo: '汝情不轻付，{{name}} 亦然；二人皆以心为门，外人难入。',
    mid: '汝与 {{name}} 之情，皆有节制，喜不纵、悲不溺。',
    hi: '汝情如春水，{{name}} 之情亦然；二人皆以喜悲为歌。',
  },
  3: {
    lo: '汝行思而后动，{{name}} 亦然；皆有静气。',
    mid: '汝与 {{name}} 皆行止有度，不为躁动所驱。',
    hi: '汝果断如风，{{name}} 行事亦果决；皆有雷霆之气。',
  },
  4: {
    lo: '汝守成重稳，{{name}} 亦然；皆以守为立身之本。',
    mid: '汝与 {{name}} 皆不偏激，守破之间有分寸。',
    hi: '汝敢破旧立新，{{name}} 亦然；皆有革新之气。',
  },
  5: {
    lo: '汝以己身为重，{{name}} 亦然；二人皆先立己而后立人。',
    mid: '汝与 {{name}} 皆公私相宜，群己之间不偏执。',
    hi: '汝以群体为先，{{name}} 亦然；二人皆忘身以济天下。',
  },
  6: {
    lo: '汝观物以理，{{name}} 亦然；皆不溺于形式。',
    mid: '汝与 {{name}} 皆情理相济，雅俗之间有度。',
    hi: '汝观物以情，{{name}} 亦然；皆重意象而轻言说。',
  },
  7: {
    lo: '汝心随顺如水，{{name}} 亦然；皆以柔为刚。',
    mid: '汝与 {{name}} 皆有坚持，亦有退让。',
    hi: '汝心如铁，{{name}} 亦然；皆以执为骨。',
  },
  8: {
    lo: '汝学求博涉，{{name}} 亦然；二人皆以通为大。',
    mid: '汝与 {{name}} 皆博而有专，专而有博。',
    hi: '汝学求深耕，{{name}} 亦然；二人皆以精为归。',
  },
  9: {
    lo: '汝向外求功，{{name}} 亦然；皆以进取为念。',
    mid: '汝与 {{name}} 皆张弛有度，不偏于进退。',
    hi: '汝向内求心安，{{name}} 亦然；皆以内省为日课。',
  },
  10: {
    lo: '汝重眼前，{{name}} 亦然；皆以当世为念。',
    mid: '汝与 {{name}} 皆兼顾眼前与长远，不偏不执。',
    hi: '汝思千载之下，{{name}} 亦然；皆以永恒为尺度。',
  },
  11: {
    lo: '汝求稳，{{name}} 亦然；皆以不输为胜。',
    mid: '汝与 {{name}} 皆善算而后动，险中求稳。',
    hi: '汝敢赌，{{name}} 亦然；皆以负为立身之姿。',
  },
  12: {
    lo: '汝言朴素，{{name}} 亦然；皆以平实见真。',
    mid: '汝与 {{name}} 皆文白相间，雅俗之间有度。',
    hi: '汝言华丽，{{name}} 亦然；皆以辞采为骨。',
  },
};

export function renderBlurb(template: string, ctx: { name: string; era: string }): string {
  return template.replace(/\{\{name\}\}/g, ctx.name).replace(/\{\{era\}\}/g, ctx.era);
}

/** 根据用户与古人在某维度的差（user - figure），返回 lo/mid/hi 段 */
export function pickPolarity(diff: number): 'lo' | 'mid' | 'hi' {
  if (diff > 0.15) return 'hi'; // 用户明显高于古人 → 偏高
  if (diff < -0.15) return 'lo'; // 用户明显低于古人 → 偏低
  return 'mid';
}

/** 从 matchBlurb（单条或数组）中选出最贴合用户特征的一条。
 *
 * 约定：若人物提供多条 blurb，它们应按该人物最显著的维度由高到低排列。
 * 算法会计算用户与人物在各维度的加权绝对差异，并在这些显著维度中选出
 * 差异最大的一项，返回对应下标的 blurb；若差异均较小，则默认返回第一条。
 */
export function selectBlurb(
  matchBlurb: string | string[],
  user: TraitVector,
  figure: TraitVector
): string {
  const templates = Array.isArray(matchBlurb) ? matchBlurb : [matchBlurb];
  if (templates.length === 1) return templates[0];

  // 取人物最显著的 N 个维度（N = blurb 数量），按人物向量值降序
  const topTraitIndices = TRAITS.map((_, i) => i)
    .sort((a, b) => figure[b] - figure[a])
    .slice(0, templates.length);

  // 在这些显著维度中，找出用户与人物差异最大的一项
  let bestLocalIndex = 0;
  let bestScore = -1;
  topTraitIndices.forEach((traitIndex, localIndex) => {
    const diff = Math.abs(user[traitIndex] - figure[traitIndex]);
    const score = diff * TRAITS[traitIndex].weight;
    if (score > bestScore) {
      bestScore = score;
      bestLocalIndex = localIndex;
    }
  });

  // 若所有显著维度的差异都不明显，退回第一条（更稳妥、可预期的默认）
  if (bestScore < 0.1) return templates[0];

  return templates[bestLocalIndex];
}

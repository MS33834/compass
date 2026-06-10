// 镜心 · 报告生成

import { TRAITS } from '../traits/trait.dimensions';
import { topN } from './matching';
import { renderBlurb, pickPolarity, BLURB } from './blurb';
import { confidence } from './confidence';
import type { TraitVector } from '../traits/trait.types';
import type { Figure } from '../figures/figure.types';
import type { Item } from '../items/item.types';

export type MatchReport = {
  primary: { figure: Figure; score: number; blurb: string };
  alternates: { figure: Figure; score: number; blurb: string }[];
  traitBreakdown: Array<{
    traitId: number;
    name: string;
    user: number;
    figure: number;
    diff: number;
    comment: string;
  }>;
  confidence: number;
};

export function buildReport(
  user: TraitVector,
  pool: readonly Figure[],
  answers: Record<string, number>,
  itemPool: readonly Item[]
): MatchReport {
  const conf = confidence(answers, itemPool);
  const top = topN(user, pool, 5);
  const [primary, ...rest] = top;

  return {
    primary: {
      figure: primary.figure,
      score: primary.score,
      blurb: renderBlurb(primary.figure.matchBlurb, {
        name: primary.figure.name,
        era: primary.figure.era,
      }),
    },
    alternates: rest.map(a => ({
      figure: a.figure,
      score: a.score,
      blurb: renderBlurb(a.figure.matchBlurb, {
        name: a.figure.name,
        era: a.figure.era,
      }),
    })),
    traitBreakdown: TRAITS.map((t, i) => {
      const u = user[i];
      const f = primary.figure.vector[i];
      const diff = u - f;
      const pol = pickPolarity(diff);
      const comment = renderBlurb(BLURB[t.id][pol], {
        name: primary.figure.name,
        era: primary.figure.era,
      });
      return {
        traitId: t.id,
        name: t.name,
        user: u,
        figure: f,
        diff,
        comment,
      };
    }),
    confidence: conf,
  };
}

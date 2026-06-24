// 指南 · 报告生成

import { TRAITS } from '../traits/trait.dimensions';
import { topN } from './matching';
import { renderBlurb, pickPolarity, BLURB, selectBlurb } from './blurb';
import { confidence } from './confidence';
import { pickLang } from '../i18n';
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
  itemPool: readonly Item[],
  lang: 'zh' | 'en'
): MatchReport | null {
  if (pool.length === 0 || itemPool.length === 0) return null;

  const conf = confidence(answers, itemPool);
  const top = topN(user, pool, 5);
  if (top.length === 0) return null;
  const [primary, ...rest] = top;

  return {
    primary: {
      figure: primary.figure,
      score: primary.score,
      blurb: renderBlurb(
        pickLang(selectBlurb(primary.figure.matchBlurb, user, primary.figure.vector), lang),
        {
          name: pickLang(primary.figure.name, lang),
          era: pickLang(primary.figure.era, lang),
        }
      ),
    },
    alternates: rest.map(a => ({
      figure: a.figure,
      score: a.score,
      blurb: renderBlurb(pickLang(selectBlurb(a.figure.matchBlurb, user, a.figure.vector), lang), {
        name: pickLang(a.figure.name, lang),
        era: pickLang(a.figure.era, lang),
      }),
    })),
    traitBreakdown: TRAITS.map((t, i) => {
      const u = user[i];
      const f = primary.figure.vector[i];
      const diff = u - f;
      const pol = pickPolarity(diff);
      const comment = renderBlurb(pickLang(BLURB[t.id][pol], lang), {
        name: pickLang(primary.figure.name, lang),
        era: pickLang(primary.figure.era, lang),
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

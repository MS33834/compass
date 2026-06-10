// 镜心 · 人物库索引

import { FIGURES_EAST_LITERATI } from './figures.east-literati';
import type { Figure, DomainId } from './figure.types';

const FIGURES_BY_DOMAIN: Record<DomainId, readonly Figure[]> = {
  'east-literati': FIGURES_EAST_LITERATI,
  'east-statesman': [],
  'east-scientist': [],
  'west-philosopher': [],
  'west-scientist': [],
};

export function figuresForDomain(d: DomainId): readonly Figure[] {
  return FIGURES_BY_DOMAIN[d];
}

export const ALL_FIGURES: readonly Figure[] = FIGURES_EAST_LITERATI;

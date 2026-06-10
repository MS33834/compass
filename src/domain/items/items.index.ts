// 镜心 · 题库索引

import { ITEMS_EAST_LITERATI } from './items.east-literati';
import type { Item } from './item.types';
import type { DomainId } from '../figures/figure.types';

const ITEMS_BY_DOMAIN: Record<DomainId, readonly Item[]> = {
  'east-literati': ITEMS_EAST_LITERATI,
  'east-statesman': [], // v0.2
  'east-scientist': [], // v0.3
  'west-philosopher': [], // v0.4
  'west-scientist': [], // v0.5
};

export function itemsForDomain(d: DomainId): readonly Item[] {
  return ITEMS_BY_DOMAIN[d];
}

export const ALL_ITEMS: readonly Item[] = ITEMS_EAST_LITERATI;

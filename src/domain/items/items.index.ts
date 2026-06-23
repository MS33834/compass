/// <reference types="vite/client" />
// 指南 · 题库索引（按域懒加载）

import type { Item } from './item.types';
import type { DomainId } from '../figures/figure.types';

type ItemModule = { readonly [exportName: string]: readonly Item[] };

const loaders = import.meta.glob<ItemModule>('./items.*.ts');

const DOMAIN_TO_LOADER: Record<DomainId, () => Promise<ItemModule>> = {
  'east-literati': loaders['./items.east-literati.ts'] as () => Promise<ItemModule>,
  'east-statesman': loaders['./items.east-statesman.ts'] as () => Promise<ItemModule>,
  'east-scientist': loaders['./items.east-scientist.ts'] as () => Promise<ItemModule>,
  'west-philosopher': loaders['./items.west-philosopher.ts'] as () => Promise<ItemModule>,
  'west-scientist': loaders['./items.west-scientist.ts'] as () => Promise<ItemModule>,
};

const cache = new Map<DomainId, readonly Item[]>();

export async function itemsForDomain(d: DomainId): Promise<readonly Item[]> {
  const cached = cache.get(d);
  if (cached) return cached;

  const loader = DOMAIN_TO_LOADER[d];
  if (!loader) return [];

  try {
    const mod = await loader();
    const exportName = Object.keys(mod).find(k => k.startsWith('ITEMS_'));
    const items = exportName ? mod[exportName] : [];
    cache.set(d, items);
    return items;
  } catch (err) {
    console.error(`Compass: failed to load items for domain ${d}`, err);
    return [];
  }
}

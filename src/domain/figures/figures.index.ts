/// <reference types="vite/client" />
// 指南 · 人物库索引（按域懒加载）

import type { Figure, DomainId } from './figure.types';

const FIGURES_COUNT: Record<DomainId, number> = {
  'east-literati': 30,
  'east-statesman': 30,
  'east-scientist': 30,
  'west-philosopher': 30,
  'west-scientist': 30,
};

type FigureModule = { readonly [exportName: string]: readonly Figure[] };

const loaders = import.meta.glob<FigureModule>('./figures.*.ts');

const DOMAIN_TO_LOADER: Record<DomainId, () => Promise<FigureModule>> = {
  'east-literati': loaders['./figures.east-literati.ts'] as () => Promise<FigureModule>,
  'east-statesman': loaders['./figures.east-statesman.ts'] as () => Promise<FigureModule>,
  'east-scientist': loaders['./figures.east-scientist.ts'] as () => Promise<FigureModule>,
  'west-philosopher': loaders['./figures.west-philosopher.ts'] as () => Promise<FigureModule>,
  'west-scientist': loaders['./figures.west-scientist.ts'] as () => Promise<FigureModule>,
};

const cache = new Map<DomainId, readonly Figure[]>();

export async function figuresForDomain(d: DomainId): Promise<readonly Figure[]> {
  const cached = cache.get(d);
  if (cached) return cached;

  const loader = DOMAIN_TO_LOADER[d];
  if (!loader) return [];

  const mod = await loader();
  const exportName = Object.keys(mod).find(k => k.startsWith('FIGURES_'));
  const figures = exportName ? mod[exportName] : [];
  cache.set(d, figures);
  return figures;
}

export function figuresCountForDomain(d: DomainId): number {
  return FIGURES_COUNT[d] ?? 0;
}

export async function findFigureById(id: string): Promise<Figure | undefined> {
  for (const figures of cache.values()) {
    const found = figures.find(f => f.id === id);
    if (found) return found;
  }

  const domains = Object.keys(DOMAIN_TO_LOADER) as DomainId[];
  const all = await Promise.all(domains.map(d => figuresForDomain(d)));
  for (const figures of all) {
    const found = figures.find(f => f.id === id);
    if (found) return found;
  }
  return undefined;
}

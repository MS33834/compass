// 镜心 · 人物库数据契约

import type { TraitVector } from '../traits/trait.types';

export type DomainId =
  | 'east-literati'
  | 'east-statesman'
  | 'east-scientist'
  | 'west-philosopher'
  | 'west-scientist';

export type Figure = {
  id: string;
  name: string;
  era: string;
  domain: DomainId;
  vector: TraitVector;
  signature: string;
  bio: string;
  portrait: string;
  matchBlurb: string;
  anecdotes: { title: string; body: string }[];
  echoes: string[];
};

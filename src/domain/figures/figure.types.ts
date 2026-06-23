// 指南 · 人物库数据契约

import type { TraitVector } from '../traits/trait.types';
import type { DOMAINS } from './domains';

export type DomainId = (typeof DOMAINS)[number];

export type Figure = {
  id: string;
  name: string;
  era: string;
  domain: DomainId;
  vector: TraitVector;
  signature: string;
  bio: string;
  portrait: string;
  /** 开篇导语；可传单条字符串保持兼容，也可传多条模板供动态选择 */
  matchBlurb: string | string[];
  anecdotes: { title: string; body: string }[];
  echoes: string[];
};

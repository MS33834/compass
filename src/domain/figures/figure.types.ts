// 指南 · 人物库数据契约

import type { TraitVector } from '../traits/trait.types';
import type { DOMAINS } from './domains';
import type { LocalString } from '../i18n';

export type DomainId = (typeof DOMAINS)[number];

export type FigureArchetype = 'thinker' | 'doer' | 'creator' | 'leader' | 'rebel' | 'sage' | 'explorer' | 'inventor';

export type Figure = {
  id: string;
  name: LocalString;
  era: LocalString;
  domain: DomainId;
  vector: TraitVector;
  signature: LocalString;
  bio: LocalString;
  portrait: string;
  /** 开篇导语；可传单条字符串保持兼容，也可传多条模板供动态选择 */
  matchBlurb: LocalString | LocalString[];
  anecdotes: { title: LocalString; body: LocalString }[];
  echoes: string[];
  /** 人物原型分类，用于多样性采样 */
  archetype?: FigureArchetype;
};

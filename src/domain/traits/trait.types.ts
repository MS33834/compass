// 镜心 · 12 维特征空间类型

/** 12 维特征的 id 范围 1-12 */
export type TraitId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** 12 维向量，每位 ∈ [0, 1] */
export type TraitVector = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

/** 单一维度的元信息 */
export type TraitMeta = {
  id: TraitId;
  /** 维度名（中文 2 字） */
  name: string;
  /** 单古字，做雷达图节点用 */
  glyph: string;
  /** 该维度在匹配算法中的权重 */
  weight: number;
  /** 0.0 端含义 */
  lo: string;
  /** 1.0 端含义 */
  hi: string;
};

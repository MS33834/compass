// 指南 · 域枚举常量
//
// 所有合法 domain 集中在此定义，避免 store / share / 组件之间重复硬编码。

export const DOMAINS = [
  'east-literati',
  'east-statesman',
  'east-scientist',
  'west-philosopher',
  'west-scientist',
] as const;

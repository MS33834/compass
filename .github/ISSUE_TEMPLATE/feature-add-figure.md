---
name: 添域 · Add a new domain
about: 为镜心新增一域（30+ 人物 + 48 题）
title: '[domain] '
labels: ['enhancement', 'domain']
assignees: []
---

## 域 · Domain

（如：东方治国名臣 / 西方中世纪 / 印度古典…）

## 人物数 · Figure count

（≥ 30）

## 题数 · Item count

（48，即 12 维 × 4）

## 区段分布 · Trait distribution

按五区段：极端外 / 偏外 / 中段 / 偏内 / 极端内。
每区段至少 N 人：

| 区段   | 人数 |
| ------ | ---- |
| 极端外 |      |
| 偏外   |      |
| 中段   |      |
| 偏内   |      |
| 极端内 |      |

## 文件结构 · File layout

- `src/domain/figures/figures.<your-domain>.ts` — 30+ 人
- `src/domain/items/items.<your-domain>.ts` — 48 题
- `src/domain/figures/figures.index.ts` — 注册
- `src/domain/items/items.index.ts` — 注册
- `src/pages/Path.tsx` — `ready: true`
- `scripts/gen-portraits.mjs` — 占位肖像
- `public/portraits/<your-domain>/` — 最终肖像

## 肖像 · Portraits

（占位 SVG 已生成 / 设计师已出 / 待补）

## 风险评估 · Risk

- [ ] 数据来源：正史为主
- [ ] 文案：不涉政治 / 民族宗教 / 现代争议 / 性别歧视
- [ ] 匹配：已在本地 `npm test` 通过
- [ ] a11y：已跑 `node tests/axe.mjs`

详见 [CONTRIBUTING.md](../../blob/main/CONTRIBUTING.md)。

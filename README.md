# 镜心 · Jingxin

> 一面问己之镜。
> A mirror for asking yourself.

镜心 是一面**纯前端、纯本地**的网页镜。汝以四十八问答之，镜心以十二维特征空间
度之，复以加权欧氏与余弦之合，**映汝于千古一人**。

第一域：**东方文人墨客**——先就三十位思想者、诗家、词人、散文家，
自老子、李贽之极端外，至杜甫、李清照之极端内，皆列于镜中。

## ✒ 理念

- **问己而已**。不评汝之高下，不为汝贴标签，亦不存汝一丝一毫于云端。
- **以算法为骨**。十二维特征空间为正交连续区间；匹配为加权欧氏与余弦之合。
  不偏、不倚、不溢美、不苛责。
- **以美为皮**。宣纸为底，霞鹜文楷为字，朱砂为印，不与"AI 量产审美"为伍。
- **以汝为度**。答毕三十问即得一位主镜与四位同道，余下皆为镜外之影。

## 🪞 玩法

1. **入镜**——三道随机启语之一。
2. **选域**——先开"东方文人墨客"一域；余四域（治国、科技、西方哲、西方科学）
   候补中。
3. **行**——四十八问。每问六选一；汝可来去。
4. **映照**——出镜。主镜一人，同道四人。十二维之差，古今之合，皆列其下。

汝所答仅存汝之本地。镜心不联网。

## 🔢 算法

- **12 维特征空间**——思辨 · 情感 · 行动 · 革新 · 群我 · 审美 ·
  意志 · 学识 · 处世 · 时间 · 风险 · 表达
- **答题 → 向量**——每题 6 选项；主维度贡献 + 副维度小幅加和；
  经 sigmoid 归一化至 [0, 1]。
- **匹配**——`0.6 × 加权欧氏相似 + 0.4 × 余弦相似`，加权见
  [`trait.dimensions.ts`](./src/domain/traits/trait.dimensions.ts)。
- **置信度**——`0.6 × 完成度 + 0.4 × 决断度`（向量的方差越大，答案越分明）。
- **金样例**——见 [`tests/golden.spec.mjs`](./tests/golden.spec.mjs)。

## 🛠 部署

```sh
npm install
npm run dev         # 本地开发
npm run build       # 产物在 dist/
npm run test        # 跑金样例
```

GitHub Pages 自动部署：`.github/workflows/pages.yml` 在 `main` 推送时构建并发布至 `gh-pages` 分支。

## 🗂 目录

```
src/
  domain/           算法与数据（traits / items / figures / matching）
  components/       通用组件
  pages/            四页：Prologue · Path · Way · Reflection
  store.ts          Zustand 全局态
  index.css         主题（墨黑/朱砂/青玉/宣纸 + 霞鹜文楷）
public/
  portraits/        30 张手绘水墨 SVG 肖像
  patterns/         宣纸底纹
tests/              金样例
.trae/documents/    产品与技术文档（prd.md / tech-arch.md）
scripts/            生成肖像脚本
```

## 📜 许可

[PolyForm Noncommercial 1.0.0](./LICENSE) —— 非商用自由使用，
商用需另行授权。

## 🙏 致

凡所问，凡所选，凡所行，皆汝之自由。镜心不立标准答案，
不评分，不存档，唯映射耳。

愿汝入镜而得己。

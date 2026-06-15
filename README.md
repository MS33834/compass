# Mirror · MindMirror

> **A glass for asking thyself.**  
> Three minutes, three millennia — find who might sit with thee among 151 figures across 5 domains.

[🌐 **Live Site**](https://badhope.github.io/MindMirror/) ·
[📦 **Repository**](https://github.com/badhope/MindMirror) ·
[📜 **Changelog**](./CHANGELOG.md) ·
[🛡 **License (PolyForm NC)**](./LICENSE)

[中文](https://badhope.github.io/MindMirror/?lang=zh) · 镜心

**Mirror** is a **local-first, privacy-first** tool for self-reflection through history.

Answer 60 questions across a 12-dimensional trait space. Mirror maps your responses to a historical counterpart — using a blend of weighted Euclidean and cosine similarity — and reveals your reflection among 151 figures from East and West.

- 🪞 **East Literati** · 30 poets, lyricists, essayists, thinkers
- 🪞 **East Statesmen** · 30 chancellors, generals, reformers
- 🪞 **East Scientists** · 30 astronomers, mathematicians, engineers
- 🪞 **West Philosophers** · 30 Greek, continental, and Anglo-American thinkers
- 🪞 **West Scientists & Ideas** · 31 founders of modern science and thought

**5 domains · 151 figures · 240 items.**  
Your answers never leave your device (`localStorage`). Mirror never talks to a server.

---

## ✒ Philosophy

- **To thyself be true** — No labels, no scores, no cloud. Just reflection.
- **Algorithm as backbone** — 12 orthogonal trait dimensions. Weighted Euclidean (0.6) + Cosine (0.4).
- **Beauty as skin** — Rice paper canvas, ink-brush typography, cinnabar seals. No cookie-cutter AI aesthetics.
- **Thou art the measure** — One primary reflection, four kindred spirits. The rest remain shadows outside the glass.

---

## 🪞 How to Play

1. **Enter** — One of three opening verses, chosen at random
2. **Choose a Domain** — East or West, five paths await
3. **Inquire** — 60 questions per domain (48 shared + 12 domain-specific). Six options each. Come and go as you please.
4. **Reflect** — Meet your primary reflection and four kindred spirits. See the 12 dimensions laid bare, where thou and the ancients align — and where you diverge.

---

## 🔢 Algorithm

- **12-Dimensional Trait Space**: 思辨 · 情感 · 行动 · 革新 · 群我 · 审美 ·
  意志 · 学识 · 处世 · 时间 · 风险 · 表达
  (Discernment · Emotion · Action · Innovation · Self-vs-Collective · Aesthetics ·
  Will · Knowledge · Social · Temporality · Risk · Expression)
- **Answer → Vector**: Each 6-option question has a primary dimension contribution + minor side-dimension bonuses. Sigmoid-normalized to [0,1].
- **Matching**: `0.6 × Weighted Euclidean + 0.4 × Cosine Similarity`
- **Confidence**: `0.6 × Completion + 0.4 × Decisiveness` (higher vector variance = clearer answers)
- **Golden Tests**: [`tests/golden.spec.mjs`](./tests/golden.spec.mjs) — 18 golden cases

See [`src/domain/traits/trait.dimensions.ts`](./src/domain/traits/trait.dimensions.ts) and
[`src/domain/matching/`](./src/domain/matching/).

---

## 🛠 Tech Stack

| Category  | Choice                                                |
| --------- | ----------------------------------------------------- |
| Framework | React 18 + TypeScript 5.5                             |
| Build     | Vite 5                                                |
| State     | Zustand 4                                             |
| Router    | None (single-page + localStorage state machine)       |
| Styling   | Vanilla CSS + CSS custom properties (`src/index.css`) |
| Fonts     | Noto Serif SC / LXGW WenKai (system-fallback)         |
| PWA       | Vanilla Service Worker (no Workbox)                   |
| Deploy    | GitHub Pages (Actions)                                |
| License   | [PolyForm Noncommercial 1.0.0](./LICENSE)             |

No third-party tracking. No analytics. No backend.

---

## 🚀 Development / Deploy

```sh
npm install           # Install dependencies
npm run dev           # Dev server (http://localhost:5173)
npm run build         # Production build to dist/
npm run build:pages   # GitHub Pages build (base = /MindMirror/)
npm run typecheck     # tsc --noEmit
npm test              # Golden cases + unit tests
npm run format        # prettier --write
```

**GitHub Pages auto-deploy**: `.github/workflows/pages.yml` builds on `main` push and deploys via
`actions/deploy-pages@v5` to `https://badhope.github.io/MindMirror/`.

**CI pipeline**: `.github/workflows/ci.yml` — `npm ci → typecheck → prettier → build → test`.

---

## 🗂 Project Structure

```
.
├── .github/
│   ├── ISSUE_TEMPLATE/         # bug-report / feature-add-figure
│   ├── workflows/              # ci.yml / pages.yml
│   └── FUNDING.yml             # 赞助
├── .trae/documents/            # 产品 / 技术文档
│   ├── prd.md
│   ├── tech-arch.md
│   ├── refactor-plan.md
│   └── golden-cases.md         # 18 条金样例
├── public/
│   ├── 404.html                # SPA 404 兜底
│   ├── favicon.svg
│   ├── manifest.webmanifest    # PWA
│   ├── robots.txt
│   ├── sw.js                   # Service Worker
│   ├── patterns/               # 宣纸底纹
│   └── portraits/              # 5 域 × 30 张手绘水墨 SVG (共 151 张)
│       ├── east-literati/      # 东方文人墨客
│       ├── east-statesman/     # 东方治国名臣
│       ├── east-scientist/     # 东方科技先驱
│       ├── west-philosopher/   # 西方哲学大家
│       └── west-scientist/     # 西方科学巨擘
├── scripts/                    # 生成肖像脚本 (gen-portraits / render-portraits)
├── src/
│   ├── components/             # 通用组件 (TopBar / BrushButton / Portrait / Progress / TraitRadar / Verse)
│   ├── domain/
│   │   ├── traits/             # 12 维定义 + 类型
│   │   ├── items/              # 5 域 × 48 题 = 240 题
│   │   ├── figures/            # 5 域 × 30 人 = 151 人 (含 1 跨域)
│   │   └── matching/           # 向量化 / 评分 / 置信度 / 文案 / 报告
│   ├── i18n/                   # zh / en 双语
│   ├── pages/                  # Prologue / Path / Way / Reflection
│   ├── App.tsx
│   ├── main.tsx
│   ├── share.ts                # 答卷导入/导出 (Base64 + URL)
│   ├── store.ts                # Zustand 全局态
│   └── index.css               # 主题（墨黑/朱砂/青玉/宣纸 + 霞鹜文楷）
├── tests/                      # axe / e2e / golden / link-check / 多视口截图
├── .editorconfig
├── .gitattributes
├── .gitignore
├── .gitleaks.toml
├── .lighthouserc.json
├── .node-version               # 20
├── .prettierrc / .prettierignore
├── .size-limit.json
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE                     # PolyForm Noncommercial 1.0.0
├── README.md                   ← 你在这里
├── SECURITY.md
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🌍 Internationalization

- `en-US` (default) — Classical-modern hybrid English
- `zh-CN` — Classical literary Chinese toggle

Toggle with the language button in the top bar. UI dicts at [`src/i18n/en.ts`](./src/i18n/en.ts) and [`src/i18n/zh.ts`](./src/i18n/zh.ts).

---

## 🧪 Quality Assurance

| Tool           | Scope                            | Config                  |
| -------------- | -------------------------------- | ----------------------- |
| `tsc --noEmit` | Types                            | `tsconfig.json`         |
| `prettier`     | Formatting                       | `.prettierrc`           |
| `npm test`     | Golden cases + unit tests        | `tests/golden.spec.mjs` |
| Lighthouse CI  | perf ≥ 85 / a11y ≥ 95 / seo ≥ 90 | `.lighthouserc.json`    |
| axe-core       | a11y (WCAG AA)                   | `tests/axe.mjs`         |
| Playwright E2E | 4 viewports (320/375/768/1280)   | `tests/e2e.mjs`         |
| size-limit     | Bundle budget ≤ 280 KB gzip      | `.size-limit.json`      |
| link-check     | Internal .md references          | `tests/link-check.mjs`  |

---

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) first.

**Adding a domain** (see [CONTRIBUTING.md](./CONTRIBUTING.md) for full details):

1. Add 30+ figures in `src/domain/figures/figures.<your-domain>.ts`
2. Add 48 items in `src/domain/items/items.<your-domain>.ts`
3. Register both in their respective `*.index.ts`
4. Set the card `ready: true` in `src/pages/Path.tsx`
5. Add placeholder portraits in `scripts/gen-portraits.mjs`

**Security**: [SECURITY.md](./SECURITY.md) — private disclosure process.

---

## 📜 License

[PolyForm Noncommercial 1.0.0](./LICENSE) — Free for non-commercial use. Commercial use requires separate licensing.
Copyright © 2024-2026 badhope (Mirror · MindMirror).

---

## 🙏 Colophon

Every question, every choice, every step is yours. Mirror sets no right answers,
keeps no scores, stores nothing but thou hast asked it to. Only the glass.

May you enter the mirror and find thyself.

---

_Made with rice paper, ink, and cinnabar. Zero AI-slop aesthetics guarantee._ 🖌️

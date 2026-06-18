# Compass · 指南

> **A quiet compass for the inner self.**  
> Three minutes, three millennia — find who might sit with thee among 150 figures across 5 domains.

[🌐 **Live Site**](https://badhope.gitcode.host/compass/) ·
[📦 **Repository**](https://gitcode.com/badhope/compass) ·
[📜 **Changelog**](./CHANGELOG.md) ·
[🛡 **License (PolyForm NC)**](./LICENSE)

[中文](https://badhope.gitcode.host/compass/?lang=zh) · 指南

**Compass** is a **local-first, privacy-first** tool for self-discovery through history.

Answer 60 questions across a 12-dimensional trait space. Compass maps your responses to a historical counterpart — using a blend of weighted Euclidean, cosine, and shape-agreement similarity — and reveals your bearing among 150 figures from East and West.

- 🧭 **East Literati** · 30 poets, lyricists, essayists, thinkers
- 🧭 **East Statesmen** · 30 chancellors, generals, reformers
- 🧭 **East Scientists** · 30 astronomers, mathematicians, engineers
- 🧭 **West Philosophers** · 30 Greek, continental, and Anglo-American thinkers
- 🧭 **West Scientists & Ideas** · 30 founders of modern science and thought

**5 domains · 150 figures · 240 items.**  
Your answers never leave your device (`localStorage`). Compass never talks to a server.

---

## ✒ Philosophy

- **To thyself be true** — No labels, no scores, no cloud. Just bearing.
- **Algorithm as backbone** — 12 orthogonal trait dimensions. Weighted Euclidean (0.45) + Cosine (0.35) + Shape-agreement (0.20).
- **Beauty as skin** — Rice paper canvas, ink-brush typography, cinnabar seals.
- **Thou art the measure** — One primary reflection, four kindred spirits. The rest remain shadows outside the glass.

---

## 🧭 How to Play

1. **Enter** — One of three opening verses, chosen at random
2. **Choose a Domain** — East or West, five paths await
3. **Inquire** — 48 questions per domain. Six options each. Come and go as you please.
4. **Reflect** — Meet your primary reflection and four kindred spirits. See the 12 dimensions laid bare, where thou and the ancients align — and where you diverge.

---

## 🔢 Algorithm

- **12-Dimensional Trait Space**: 思辨 · 情感 · 行动 · 革新 · 群我 · 审美 ·
  意志 · 学识 · 处世 · 时间 · 风险 · 表达
  (Discernment · Emotion · Action · Innovation · Self-vs-Collective · Aesthetics ·
  Will · Knowledge · Social · Temporality · Risk · Expression)
- **Answer → Vector**: Each 6-option question has a primary dimension contribution + minor side-dimension bonuses. Sigmoid-normalized to [0,1].
- **Matching**: `0.45 × Weighted Euclidean + 0.35 × Cosine Similarity + 0.20 × Shape-agreement`
- **Confidence**: `0.45 × Completion + 0.25 × Decisiveness + 0.20 × Consistency + 0.10 × Balance`
- **Golden Tests**: [`tests/golden.spec.mjs`](./tests/golden.spec.mjs) — 5 golden cases

See [`src/domain/traits/trait.dimensions.ts`](./src/domain/traits/trait.dimensions.ts) and
[`src/domain/matching/`](./src/domain/matching/).

---

## 🛠 Tech Stack

| Category  | Choice                                                |
| --------- | ----------------------------------------------------- |
| Framework | React 18 + TypeScript 5.5                             |
| Build     | Vite 8                                                |
| State     | Zustand 4                                             |
| Router    | None (single-page + localStorage state machine)       |
| Styling   | Vanilla CSS + CSS custom properties (`src/index.css`) |
| Fonts     | Noto Serif SC / LXGW WenKai (system-fallback)         |
| PWA       | Vanilla Service Worker (no Workbox)                   |
| Deploy    | GitCode Pages                                         |
| License   | [PolyForm Noncommercial 1.0.0](./LICENSE)             |

No third-party tracking. No analytics. No backend.

---

## 🚀 Development / Deploy

```sh
npm install           # Install dependencies
npm run dev           # Dev server (http://localhost:5173)
npm run build         # Production build to dist/
npm run build:pages   # Static Pages build (base = /compass/)
npm run typecheck     # tsc --noEmit
npm test              # Golden cases + unit tests
npm run format        # prettier --write
```

**GitCode Pages auto-deploy**: push to `main` and enable Pages in project settings.

**Recent UX updates**:

- Answer page (`Way`) uses a fixed viewport: no body scrolling, prompt + options centered, navigation always visible.
- Theme / language toggles are available inside the answer page for an immersive experience.
- Dark mode portraits are dimmed so the light SVG canvas does not blow out against the dark theme.

**CI pipeline**: `.gitlab-ci.yml` — `npm ci → typecheck → test → build:pages → GitCode Pages deploy`.

---

## 🗂 Project Structure

```
.
├── .github/
│   ├── ISSUE_TEMPLATE/         # bug-report / feature-add-figure
│   ├── workflows/              # ci.yml / pages.yml
│   └── FUNDING.yml             # 赞助
├── public/
│   ├── 404.html                # SPA 404 回退
│   ├── favicon.svg
│   ├── manifest.webmanifest    # PWA
│   ├── robots.txt
│   ├── sw.js                   # Service Worker
│   ├── patterns/               # 宣纸底纹
│   └── portraits/              # 5 域 × 30 张手绘水墨 SVG (共 150 张)
│       ├── east-literati/      # 东方文人墨客
│       ├── east-statesman/     # 东方治国名臣
│       ├── east-scientist/     # 东方科技先驱
│       ├── west-philosopher/   # 西方哲学大家
│       └── west-scientist/     # 西方科学巨擘
├── scripts/                    # 生成肖像脚本 (gen-portraits / render-portraits)
├── src/
│   ├── components/             # 通用组件 (TopBar / BrushButton / Portrait / TraitRadar / Verse)
│   ├── domain/
│   │   ├── traits/             # 12 维定义 + 类型
│   │   ├── items/              # 5 域 × 48 题 = 240 题
│   │   ├── figures/            # 5 域 × 30 人 = 150 人
│   │   └── matching/           # 向量化 / 评分 / 置信度 / 文案 / 报告
│   ├── i18n/                   # zh / en 双语
│   ├── pages/                  # Prologue / Path / Way / Reflection
│   ├── App.tsx
│   ├── main.tsx
│   ├── share.ts                # 答卷导入/导出 (Base64 + URL)
│   ├── store.ts                # Zustand 全局态
│   └── index.css               # 主题（墨黑/朱砂/青玉/宣纸 + 霞鹜文楷）
├── tests/                      # axe / e2e / golden / unit
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

| Tool           | Scope                          | Config                  |
| -------------- | ------------------------------ | ----------------------- |
| `tsc --noEmit` | Types                          | `tsconfig.json`         |
| `prettier`     | Formatting                     | `.prettierrc`           |
| `npm test`     | Golden cases + unit tests      | `tests/golden.spec.mjs` |
| axe-core       | a11y (WCAG AA)                 | `tests/axe.mjs`         |
| Playwright E2E | 4 viewports (320/375/768/1280) | `tests/e2e.mjs`         |

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
Copyright © 2024-2026 badhope (Compass · 指南).

---

## 🙏 Colophon

Every question, every choice, every step is yours. Compass sets no right answers,
keeps no scores, stores nothing but thou hast asked it to. Only the bearing.

May you take the bearing and find thyself.

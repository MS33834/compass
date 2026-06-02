<div align="center">

<!-- Hero banner -->
<img src="https://raw.githubusercontent.com/badhope/MindMirror/master/public/docs/hero-banner.jpg" alt="MindMirror" width="100%" style="max-width: 980px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,.08); margin: 0 auto 2rem;" />

# 🧠 MindMirror

**Open-Source · Self-Hosted · Privacy-First Psychological Assessment Platform**

> *Discover yourself. Grow every day.*

<!-- Badges -->
![License](https://img.shields.io/badge/license-MIT-6DD58C?style=for-the-badge)
![Stars](https://img.shields.io/github/stars/badhope/MindMirror?style=for-the-badge&color=FF6B6B)
![Forks](https://img.shields.io/github/forks/badhope/MindMirror?style=for-the-badge&color=4ECDC4)
![Last commit](https://img.shields.io/github/last-commit/badhope/MindMirror?style=for-the-badge)
![Top language](https://img.shields.io/github/languages/top/badhope/MindMirror?style=for-the-badge&color=3178C6)

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css&logoColor=white)

[**🌐 Live Demo (GitHub Pages)**](https://badhope.github.io/MindMirror/) · [**📖 Documentation**](#-quick-start) · [**🐳 Deploy with Docker**](#-deployment) · [**🌍 中文**](#-mindmirror-1)

</div>

---

## ✨ Highlights

| | Feature | Description |
|---|---------|-------------|
| 🧠 | **Big Five Personality** | 50-item IPIP/NEO-PI-R derived test with radar charts and trait explanations |
| 😰 | **PSS-10 Stress** | Cohen's Perceived Stress Scale with clinical thresholds and personalized advice |
| 😨 | **GAD-7 Anxiety** | Clinically validated Generalized Anxiety Disorder screener |
| 😊 | **Mood Tracker** | Daily logging with trend chart, emoji tags, and history export |
| 🏆 | **Achievements** | Gamified progress with milestone rewards |
| 📊 | **Compare** | Side-by-side comparison of two assessment results |
| 💪 | **Mental Training** | CBT-based exercises, breathing techniques, journaling |
| 🔌 | **Plugin System** | Drop in custom assessments via JSON |
| 🌐 | **i18n (EN / 中文)** | Full bilingual support, language switcher in nav |
| 🐳 | **One-Command Deploy** | `docker compose up` brings the whole stack online |
| 🔐 | **JWT Auth** | Email/password sign-up, login, guest accounts |
| 📱 | **PWA-ready** | Installable, offline-capable, mobile-first |
| 🎨 | **Framer Motion** | Polished micro-interactions throughout |
| 💾 | **Self-Hosted Data** | Your data lives in your own PostgreSQL — no third party |

---

## 🖼️ Screenshots

| Home | Big Five Result |
|------|-----------------|
| <img src="https://raw.githubusercontent.com/badhope/MindMirror/master/public/docs/hero-banner.jpg" alt="Home" width="100%" /> | <img src="https://raw.githubusercontent.com/badhope/MindMirror/master/public/docs/hero-banner.jpg" alt="Result" width="100%" /> |

> *Visit the [live demo](https://badhope.github.io/MindMirror/) to see the actual UI — it's the same code that powers self-hosted deployments.*

---

## 🚀 Quick Start

### Option A — Local development (hot reload)

```bash
git clone https://github.com/badhope/MindMirror.git
cd MindMirror

# 1) Frontend
npm install
npm run dev          # http://localhost:5173  (Vite, with /api proxy)

# 2) Backend (separate terminal)
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# For local dev without Postgres, edit .env:
#   DATABASE_URL=sqlite:///./mental_health.db
#   SECRET_KEY=dev-secret-key-replace-in-production
python3 init_db.py --seed   # creates tables + demo@mindmirror.app / demo123
python3 run.py              # http://localhost:8000  (FastAPI)
```

### Option B — Docker (production)

```bash
git clone https://github.com/badhope/MindMirror.git
cd MindMirror

cp .env.example .env
# Edit .env and set a strong SECRET_KEY (used to sign JWTs)

docker compose up -d --build
```

That spins up three containers behind a single port 80:

| Service     | Port (host) | Purpose |
|-------------|-------------|---------|
| `frontend`  | **80**      | nginx → React SPA, reverse-proxies `/api/*` to the backend |
| `backend`   | —           | FastAPI on 8000 (internal network only) |
| `postgres`  | —           | PostgreSQL 15 (internal network only) |

Verify:

```bash
curl http://localhost/health            # nginx
curl http://localhost/api/v1/health     # FastAPI
open http://localhost                   # UI
open http://localhost/api/v1/docs       # Swagger UI
```

### Option C — Just preview the UI (no backend)

Open the [GitHub Pages demo](https://badhope.github.io/MindMirror/) — the app
auto-detects the missing backend and falls back to a privacy-respecting
**local-only mode** where everything (accounts, results, mood) stays in
your browser's `localStorage`.

---

## 🏗️ Architecture

```
                    ┌────────────────────────────────────┐
                    │         Browser / PWA              │
                    │  React 18 · TypeScript · Vite 6    │
                    │  Zustand · Framer Motion · i18n    │
                    └──────────┬─────────────────────────┘
                               │ HTTPS
                               ▼
                    ┌────────────────────────────────────┐
                    │   nginx (port 80) — single entry   │
                    │   - serves /assets (cache 1y)      │
                    │   - reverse-proxy /api/*  ──────┐  │
                    │   - SPA fallback → index.html   │  │
                    └────────────────────────────────┘  │
                                                     │   │
                              ┌──────────────────────┘   │
                              ▼                          │
                    ┌─────────────────────────────┐     │
                    │  FastAPI (port 8000, intra) │     │
                    │  /auth  /assessments        │     │
                    │  /results  /training        │     │
                    │  /mood  /achievements       │     │
                    │  JWT (HS256) + bcrypt       │     │
                    └──────────┬──────────────────┘     │
                               │                        │
                               ▼                        │
                    ┌─────────────────────────────┐     │
                    │   PostgreSQL 15             │     │
                    │   (volume-mounted, intra)   │     │
                    └─────────────────────────────┘     │
                                                       │
        GitHub Pages deployment (showcase):            │
        ┌────────────────────────────────────────┐     │
        │ badhope.github.io/MindMirror/  ────────┼─────┘
        │  (no backend → localStorage mode)
        └────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend** | React 18 + TypeScript 5.8 + Vite 6 | Best DX, fast HMR, type safety |
| **State** | Zustand 5 | Minimal, no boilerplate, persists nicely |
| **Styling** | Tailwind 3 + Framer Motion 12 | Utility-first + smooth animations |
| **Routing** | React Router v7 (HashRouter on Pages) | Works on any static host |
| **i18n** | Hand-rolled EN / ZH dictionaries | Zero dependencies, full control |
| **Backend** | Python 3.12 + FastAPI 0.115 + Pydantic v2 | Async, fast, type-safe, auto-docs |
| **ORM** | SQLAlchemy 2 | Cross-dialect (PG / SQLite) with `JSONB` shim |
| **Auth** | JWT (HS256) via `python-jose` + `bcrypt` | Simple, no external IdP needed |
| **DB** | PostgreSQL 15 (Docker) / SQLite (dev) | Battle-tested, single-binary SQLite fallback |
| **Container** | Docker + Compose, multi-stage builds | One command to deploy |
| **CI/CD** | GitHub Actions (typecheck + lint + Pages) | Free for OSS, zero config |

---

## 📁 Project Structure

```
MindMirror/
├── src/                              # React + TypeScript frontend
│   ├── components/                   # UI components (Sidebar, DailyTips, …)
│   │   ├── animations/               # Framer Motion animation primitives
│   │   ├── dashboard/                # Personal dashboard
│   │   └── plugin/                   # Plugin system UI
│   ├── data/                         # Built-in assessment question banks
│   ├── hooks/                        # Custom React hooks
│   ├── i18n/                         # en.ts, zh.ts translation tables
│   ├── lib/                          # apiClient, utility helpers
│   ├── pages/                        # Route-level pages
│   ├── services/                     # Scoring, auth, mood, training, plugins
│   ├── store/                        # Zustand global state
│   ├── types/                        # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── backend/                          # FastAPI backend
│   ├── app/
│   │   ├── api/                      # Route handlers (auth/results/mood/…)
│   │   ├── core/                     # security helpers
│   │   ├── models/                   # SQLAlchemy ORM models
│   │   ├── schemas/                  # Pydantic v2 schemas
│   │   ├── config.py                 # pydantic-settings
│   │   ├── database.py               # SQLAlchemy engine + session
│   │   ├── dependencies.py           # Reusable FastAPI dependencies
│   │   └── main.py                   # FastAPI app entrypoint
│   ├── .env.example
│   ├── init_db.py                    # Create tables + optional demo seed
│   ├── requirements.txt
│   └── run.py                        # Dev runner (auto-detects docker vs sqlite)
├── scripts/
│   └── postbuild.mjs                 # Copies dist/index.html → dist/404.html
├── public/                           # Static assets (favicons, og-image, docs/)
├── .github/workflows/
│   ├── ci.yml                        # typecheck + lint on every PR
│   └── deploy-pages.yml              # build + deploy GitHub Pages
├── Dockerfile                        # Backend image
├── Dockerfile.frontend               # Frontend image (node build → nginx)
├── docker-compose.yml                # postgres + backend + frontend
├── nginx.conf                        # Reverse proxy / SPA fallback
├── .env.example                      # Compose env template
├── vite.config.ts
├── package.json
├── tsconfig.json
├── README.md                         # You are here
├── CHANGELOG.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
└── LICENSE                           # MIT
```

---

## 🔌 API Reference (FastAPI)

All endpoints are prefixed with `/api/v1`. Interactive docs at `/api/v1/docs`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | `/health` | — | Liveness probe |
| POST   | `/auth/register` | — | Create account (`email`, `username`, `password`) |
| POST   | `/auth/login` | — | OAuth2 password flow → JWT |
| POST   | `/auth/guest` | — | Issue a guest account |
| GET    | `/auth/me` | ✅ | Current user |
| PATCH  | `/auth/me` | ✅ | Update `username` / `email` / `avatar_url` |
| POST   | `/auth/logout` | ✅ | Invalidate session |
| DELETE | `/auth/account` | ✅ | Delete account |
| GET    | `/assessments/` | — | List built-in assessment definitions |
| GET    | `/results/` | ✅ | List user's results (`?assessment_id=` filter) |
| POST   | `/results/` | ✅ | Save a pre-computed result (frontend scores locally) |
| GET    | `/results/{id}` | ✅ | Fetch one result |
| DELETE | `/results/{id}` | ✅ | Delete one result |
| GET    | `/mood/` | ✅ | List mood entries |
| POST   | `/mood/` | ✅ | Create a mood entry |
| PATCH  | `/mood/{id}` | ✅ | Update a mood entry |
| DELETE | `/mood/{id}` | ✅ | Delete a mood entry |
| GET    | `/achievements/` | ✅ | List unlocked achievements |
| POST   | `/achievements/` | ✅ | Unlock (idempotent) |
| DELETE | `/achievements/{id}` | ✅ | Remove |
| GET    | `/training/` | ✅ | List training plans |

`✅` = `Authorization: Bearer <jwt>` required.

---

## 🌐 Deployment Options

| Where | How | Backend? |
|-------|-----|----------|
| **GitHub Pages** (showcase) | Push → Actions builds and deploys | No — localStorage mode |
| **Vercel / Netlify** | Connect repo, build `npm run build:pages` | No — localStorage mode |
| **Cloudflare Pages** | Same as Vercel | No — localStorage mode |
| **Your own VPS** | `docker compose up -d --build` | Yes — full FastAPI + PostgreSQL |
| **K8s / Helm** | Adapt the compose file | Yes |

For the showcase-only mode, **no environment variables are required** — the
app auto-detects the missing backend and switches to local-only storage.

---

## 🧪 Assessments

### Big Five (NEO-PI-R based, 50 items)

The "OCEAN" traits with sub-facets:

- **Openness** — Imagination, creativity, curiosity
- **Conscientiousness** — Organization, responsibility, diligence
- **Extraversion** — Sociability, assertiveness, positive emotions
- **Agreeableness** — Cooperation, trust, empathy
- **Neuroticism** — Emotional stability, anxiety, moodiness

### PSS-10 (Cohen's Perceived Stress Scale)

10 items, scored into Low / Moderate / High. Includes evidence-based tips for
each level.

### GAD-7 (Generalized Anxiety Disorder)

7 items, scored 0–21 with the standard clinical cutoffs (Minimal / Mild /
Moderate / Severe).

### Mood & Achievements

Track your daily mood on a 1–10 scale with tags, view trends, and unlock
achievements as you go (e.g. "First Assessment", "7-Day Streak",
"Mood Master").

---

## 🤝 Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
git checkout -b feature/amazing-feature
npm run typecheck && npm run lint
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature
# Open a PR — CI runs typecheck + lint + build automatically
```

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🔒 Security

- Production deployments **must** set a strong `SECRET_KEY` in `.env`:
  `openssl rand -base64 64`
- Never expose the backend or PostgreSQL ports to the public internet.
- Put the nginx frontend behind HTTPS in production (Traefik, Caddy, Cloudflare, …).
- Report vulnerabilities privately — see [SECURITY.md](SECURITY.md).

---

## 📄 License

[MIT](LICENSE) © 2024-2026 badhope

---

## 🙏 Acknowledgments

- Assessment methodologies based on [IPIP](https://ipip.ori.org/) (International Personality Item Pool)
- GAD-7 from [Spitzer et al.](https://doi.org/10.1001/archpsyc.63.9.1043)
- PSS-10 from [Cohen et al.](https://doi.org/10.1037/t00791-000)
- Inspired by [MindGarden](https://www.mindgarden.com/) and [16Personalities](https://www.16personalities.com/)

---

## 🌟 Star History

If MindMirror helps you, please ⭐ the repo — it means a lot!

[![Star History Chart](https://api.star-history.com/svg?repos=badhope/MindMirror&type=Timeline)](https://star-history.com/#badhope/MindMirror&Timeline)

---

<br><br>

<div align="center">

# 🧠 MindMirror

**开源 · 自托管 · 隐私优先的心理测评平台**

> *发现自我，每天成长。*

![License](https://img.shields.io/badge/license-MIT-6DD58C?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)

[**🇺🇸 English**](#-mindmirror) · [**🌐 线上演示（GitHub Pages）**](https://badhope.github.io/MindMirror/) · [**🐳 Docker 部署**](#-docker-部署-1)

</div>

---

## ✨ 功能亮点

| | 功能 | 描述 |
|---|------|------|
| 🧠 | **大五人格测评** | 50 题 IPIP / NEO-PI-R 量表，含雷达图与特质解读 |
| 😰 | **压力评估（PSS-10）** | Cohen 感知压力量表，附临床阈值与个性化建议 |
| 😨 | **焦虑评估（GAD-7）** | 临床广泛性焦虑筛查量表 |
| 😊 | **心情追踪** | 每日 1–10 评分、emoji 标签、历史趋势图 |
| 🏆 | **成就系统** | 游戏化进度与里程碑奖励 |
| 📊 | **结果对比** | 不同时期测评结果并排对比 |
| 💪 | **心理训练** | CBT 练习、呼吸训练、情绪日记 |
| 🔌 | **插件系统** | 通过 JSON 即可加载自定义测评 |
| 🌐 | **国际化（EN / 中文）** | 完整双语，顶部一键切换 |
| 🐳 | **一键 Docker 部署** | `docker compose up` 启动全栈 |
| 🔐 | **JWT 认证** | 邮箱密码注册、登录、游客账号 |
| 📱 | **PWA** | 可安装、离线友好、移动优先 |
| 🎨 | **Framer Motion** | 全站精致微交互 |
| 💾 | **数据自托管** | 所有数据保存在你自己的 PostgreSQL 中 |

---

## 🚀 快速开始

### 方式一：本地开发（热更新）

```bash
git clone https://github.com/badhope/MindMirror.git
cd MindMirror

# 1) 前端
npm install
npm run dev          # http://localhost:5173

# 2) 后端（另开终端）
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# 本地无 Postgres 时，编辑 .env：
#   DATABASE_URL=sqlite:///./mental_health.db
#   SECRET_KEY=dev-secret-key-replace-in-production
python3 init_db.py --seed   # 建表 + 演示账号 demo@mindmirror.app / demo123
python3 run.py              # http://localhost:8000
```

### 方式二：Docker 部署

```bash
git clone https://github.com/badhope/MindMirror.git
cd MindMirror

cp .env.example .env
# 编辑 .env 设置一个强随机 SECRET_KEY

docker compose up -d --build
```

启动后：

- 前端 + 反向代理：`http://localhost`
- API 文档：`http://localhost/api/v1/docs`
- 健康检查：`http://localhost/health`

### 方式三：只看不部署

打开 [GitHub Pages 演示](https://badhope.github.io/MindMirror/) — 应用会自动
检测到后端不可用，并切换到隐私友好的**本地模式**，所有数据（账号、结果、
心情）都保存在你浏览器的 `localStorage` 中。

---

## 🏗️ 架构

```
                    ┌────────────────────────────────────┐
                    │         浏览器 / PWA               │
                    │  React 18 · TypeScript · Vite 6    │
                    └──────────┬─────────────────────────┘
                               │ HTTPS
                               ▼
                    ┌────────────────────────────────────┐
                    │   nginx (port 80) — 唯一入口       │
                    │   - 静态资源 /assets 缓存 1y        │
                    │   - 反代 /api/*  ──────┐           │
                    │   - SPA fallback       │           │
                    └────────────────────────┼───────────┘
                                             ▼
                    ┌────────────────────────────────────┐
                    │  FastAPI (port 8000, 内网)         │
                    │  /auth /assessments /results        │
                    │  /training /mood /achievements     │
                    │  JWT (HS256) + bcrypt               │
                    └──────────┬─────────────────────────┘
                               ▼
                    ┌────────────────────────────────────┐
                    │   PostgreSQL 15（数据卷持久化）     │
                    └────────────────────────────────────┘

        GitHub Pages 展示部署（无后端）：
        ┌────────────────────────────────────────────┐
        │ badhope.github.io/MindMirror/  → localStorage
        └────────────────────────────────────────────┘
```

---

## 🛠️ 技术栈

| 层级 | 选型 | 理由 |
|------|------|------|
| **前端** | React 18 + TypeScript 5.8 + Vite 6 | 最佳 DX、快速 HMR、类型安全 |
| **状态** | Zustand 5 | 极简、零样板、可持久化 |
| **样式** | Tailwind 3 + Framer Motion 12 | 原子化 CSS + 流畅动画 |
| **路由** | React Router v7（Pages 用 HashRouter） | 适配任意静态托管 |
| **i18n** | 手写 EN / ZH 字典 | 零依赖、完全可控 |
| **后端** | Python 3.12 + FastAPI 0.115 + Pydantic v2 | 异步、极速、类型安全、自动文档 |
| **ORM** | SQLAlchemy 2 | 跨方言（PG / SQLite），含 `JSONB` 兼容层 |
| **认证** | JWT (HS256) + `python-jose` + `bcrypt` | 简单、无外部 IdP |
| **数据库** | PostgreSQL 15（Docker）/ SQLite（开发） | 久经考验，SQLite 单文件兜底 |
| **容器** | Docker + Compose，多阶段构建 | 一条命令部署 |
| **CI/CD** | GitHub Actions（typecheck + lint + Pages） | 开源免费，零配置 |

---

## 📁 项目结构

```
MindMirror/
├── src/                              # React + TypeScript 前端
│   ├── components/                   # UI 组件（Sidebar、DailyTips…）
│   ├── data/                         # 内置测评题库
│   ├── hooks/                        # 自定义 React hooks
│   ├── i18n/                         # en.ts / zh.ts 翻译表
│   ├── lib/                          # apiClient、工具函数
│   ├── pages/                        # 路由级页面
│   ├── services/                     # 评分、认证、心情、训练、插件
│   ├── store/                        # Zustand 全局状态
│   └── types/                        # TypeScript 类型
├── backend/                          # FastAPI 后端
│   ├── app/
│   │   ├── api/                      # 路由处理（auth/results/mood/…）
│   │   ├── core/                     # 安全工具
│   │   ├── models/                   # SQLAlchemy ORM 模型
│   │   ├── schemas/                  # Pydantic v2 schemas
│   │   ├── config.py                 # pydantic-settings
│   │   ├── database.py               # SQLAlchemy engine + session
│   │   ├── dependencies.py           # 可复用 FastAPI 依赖
│   │   └── main.py                   # FastAPI 入口
│   ├── .env.example
│   ├── init_db.py                    # 建表 + 可选种子
│   ├── requirements.txt
│   └── run.py                        # 开发服务器（自动检测 docker/sqlite）
├── scripts/
│   └── postbuild.mjs                 # dist/index.html → dist/404.html
├── public/                           # 静态资源
├── .github/workflows/
│   ├── ci.yml                        # 每次 PR：typecheck + lint
│   └── deploy-pages.yml              # 推 master/main → GitHub Pages
├── Dockerfile                        # 后端镜像
├── Dockerfile.frontend               # 前端镜像（node build → nginx）
├── docker-compose.yml                # postgres + backend + frontend
├── nginx.conf                        # 反代 + SPA fallback
├── .env.example                      # Compose 环境模板
├── package.json
├── tsconfig.json
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
└── LICENSE                           # MIT
```

---

## 🔌 API 速查（FastAPI）

所有接口前缀为 `/api/v1`，交互文档见 `/api/v1/docs`。

| 方法 | 路径 | 鉴权 | 描述 |
|------|------|------|------|
| GET    | `/health` | — | 健康探针 |
| POST   | `/auth/register` | — | 注册（email / username / password） |
| POST   | `/auth/login` | — | OAuth2 密码流登录，返回 JWT |
| POST   | `/auth/guest` | — | 游客账号 |
| GET    | `/auth/me` | ✅ | 当前用户 |
| PATCH  | `/auth/me` | ✅ | 更新 username / email / avatar_url |
| POST   | `/auth/logout` | ✅ | 注销会话 |
| DELETE | `/auth/account` | ✅ | 删除账号 |
| GET    | `/assessments/` | — | 内置测评定义 |
| GET / POST | `/results/` | ✅ | 测评结果列表 / 提交（前端本地评分） |
| GET / DELETE | `/results/{id}` | ✅ | 单条结果 |
| GET / POST / PATCH / DELETE | `/mood/` | ✅ | 心情 CRUD |
| GET / POST / DELETE | `/achievements/` | ✅ | 成就（解锁幂等） |
| GET    | `/training/` | ✅ | 训练计划 |

`✅` = 需要 `Authorization: Bearer <jwt>`。

---

## 🌐 部署选项

| 目标 | 方式 | 是否需要后端 |
|------|------|--------------|
| **GitHub Pages**（展示） | 推送 → Actions 自动构建部署 | 否 — localStorage 模式 |
| **Vercel / Netlify** | 链接仓库，build `npm run build:pages` | 否 — localStorage 模式 |
| **Cloudflare Pages** | 同 Vercel | 否 — localStorage 模式 |
| **自己的 VPS** | `docker compose up -d --build` | 是 — 完整 FastAPI + PostgreSQL |
| **K8s / Helm** | 把 compose 改造为 chart | 是 |

**展示模式不需要任何环境变量** — 应用会自动检测后端不可用，并切换到本地模式。

---

## 🧪 测评介绍

### 大五人格（NEO-PI-R，50 题）

五大核心特质 + 子维度雷达图：

- **开放性** — 想象力、创造力、好奇心
- **尽责性** — 条理性、责任感、勤奋
- **外向性** — 社交性、主动性、积极情绪
- **宜人性** — 合作性、信任感、同理心
- **神经质** — 情绪稳定性、焦虑、情绪波动

### PSS-10 感知压力量表

10 题，划分低 / 中 / 高三档，附各档循证建议。

### GAD-7 广泛性焦虑量表

7 题，0–21 分，使用标准临床切点（轻 / 轻中 / 中重 / 重）。

### 心情 & 成就

每日 1–10 评分 + emoji 标签，趋势图可视化，连续记录解锁成就（如「首次测评」「连续 7 天」「心情达人」）。

---

## 🤝 贡献指南

欢迎贡献！详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

```bash
git checkout -b feature/amazing-feature
npm run typecheck && npm run lint
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature
# 提 PR，CI 自动跑 typecheck + lint + build
```

请遵守 [Code of Conduct](CODE_OF_CONDUCT.md)。

---

## 🔒 安全

- 生产部署**必须**在 `.env` 设置强随机 `SECRET_KEY`：`openssl rand -base64 64`
- 不要把后端或 PostgreSQL 端口直接暴露公网
- 生产环境请把 nginx 放在 HTTPS 后面（Traefik / Caddy / Cloudflare…）
- 发现漏洞请私下上报，详见 [SECURITY.md](SECURITY.md)

---

## 📄 协议

[MIT](LICENSE) © 2024-2026 badhope

---

## 🙏 致谢

- 测评方法论基于 [IPIP](https://ipip.ori.org/)（国际人格题库）
- GAD-7 量表来自 [Spitzer et al.](https://doi.org/10.1001/archpsyc.63.9.1043)
- PSS-10 来自 [Cohen et al.](https://doi.org/10.1037/t00791-000)
- 灵感来自 [MindGarden](https://www.mindgarden.com/) 和 [16Personalities](https://www.16personalities.com/)

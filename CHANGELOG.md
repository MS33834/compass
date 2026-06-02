# Changelog

All notable changes to MindMirror are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-06-02

### 🎉 Initial Open-Source Release

First public release of MindMirror as a fully self-hostable, Docker-based
psychological assessment platform.

#### ✨ Frontend
- Big Five personality assessment (NEO-PI-R based, 50 items, IPIP-derived)
- PSS-10 perceived stress scale
- GAD-7 anxiety screening
- Daily mood tracker with trend chart
- Achievements system
- Compare results across time
- Personal dashboard
- CBT-based mental training plans
- Plugin system for custom assessments
- Crisis resources page (international hotlines)
- Bilingual UI: English / 简体中文
- Smooth Framer Motion animations
- Mobile-first responsive layout
- Dark-mode aware meta themes
- **Local-only demo mode** (offline-first, no backend required) for
  GitHub Pages and quick previews

#### 🛠 Backend (new, replaces previous Supabase + Vercel stack)
- FastAPI 0.115 + Python 3.12
- SQLAlchemy 2 + Pydantic v2
- JWT (HS256) auth via `python-jose`
- `bcrypt` password hashing (no passlib)
- PostgreSQL 15 (Docker) / SQLite (local dev) with `JSONB`-compatible
  cross-dialect column
- Modules: `auth`, `assessments`, `results`, `training`, `mood`,
  `achievements`
- Auto-create tables on startup (no Alembic needed for the demo)
- `init_db.py` with optional `--seed` demo account
- CORS-aware, secure headers, input validation

#### 🐳 Container & Deployment
- Multi-service `docker compose`: `postgres`, `backend`, `frontend`
- Multi-stage frontend build: Vite → nginx
- nginx reverse proxy for `/api/*` to backend
- Healthchecks on every service
- `.dockerignore` to keep image size small
- Persistent PostgreSQL volume

#### 🌐 GitHub Pages (showcase)
- Live demo at https://badhope.github.io/MindMirror/
- Hash-routed SPA, works under any sub-path
- `postbuild.mjs` produces `dist/404.html` for clean deep links
- GitHub Actions: type-check + lint on every PR, build & deploy Pages
  on push to `master`/`main`

#### 📦 Project Hygiene
- Removed Vercel serverless `api/`, `vercel.json`, `@vercel/node`
- Removed Supabase directory and `src/lib/supabase.ts`
- Removed unused Express / CORS / dotenv / nodemon / tsx dependencies
- Added `LICENSE` (MIT), `CODE_OF_CONDUCT`, `SECURITY`, `CHANGELOG`
- Refreshed bilingual `README.md` and `CONTRIBUTING.md`

[1.0.0]: https://github.com/badhope/MindMirror/releases/tag/v1.0.0

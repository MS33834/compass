# MindMirror

**A quiet, science-based app for checking in with yourself.**

Three short assessments — your personality, your stress, your anxiety.
No accounts required. No ads. No data sold. Results stay on your device
or on infrastructure you control.

🌐 **Live demo:** [mindmirror.app](https://mindmirror.app) ·
📖 **For users:** [USER_GUIDE.md](USER_GUIDE.md) ·
📖 **用户指南:** [USER_GUIDE.zh-CN.md](USER_GUIDE.zh-CN.md)

---

## What it does

- **Big Five (BFI)** — five trait dimensions, fifty short statements.
  The "ocean" model used in personality research since the 1980s.
- **PSS-10** — ten items that capture how overwhelmed you've felt
  in the last month. The most-used perceived-stress scale worldwide.
- **GAD-7** — seven items for generalised anxiety. A standard
  first-line screening tool.

Each takes 10–15 minutes. After the questionnaire you get a multi-axis
report (radar chart + plain-language explanation), and the result is
saved to your private history so you can see how you change over time.

A daily mood log, an achievement board, and a CBT-style training-plan
generator round out the app — everything you need for a regular
self-check-in, in one place.

## Who is it for

- **Individuals** who want a structured look at themselves.
- **Therapists & coaches** who want to send a client a baseline
  before the first session.
- **Small teams / HR** who want a one-off anonymous wellness
  check-in (GDPR-friendly by default).

## Why MindMirror

- **Open source** — MIT-licensed, audit the code, self-host for free.
- **No vendor lock-in** — your data sits in Postgres or in your
  browser. Both are easy to export and back up.
- **Real scales** — the same questionnaires a clinician would hand
  you, not a "vibe quiz".
- **Bilingual** — English and 简体中文 at the moment, easy to add
  more because the i18n layer is just two flat dictionaries.

## Try it (no install)

The static demo runs entirely in your browser — no account, no
network calls. Open it here:

**[mindmirror.app](https://mindmirror.app)**

Everything you do stays in `localStorage`. Open the DevTools console
and type `localStorage.clear()` to wipe it.

## Run the full version (local + your own database)

You'll need Docker and ~5 minutes.

```bash
git clone https://github.com/badhope/MindMirror.git
cd MindMirror
docker compose up -d
```

That's it. The frontend is on http://localhost:5173, the API on
http://localhost:8000/docs, and Postgres stores your data.

For a step-by-step dev setup (without Docker), see
[CONTRIBUTING.md](CONTRIBUTING.md).

## How your data is handled

- **Static demo (the GitHub Pages one):** everything stays in your
  browser's `localStorage`. We never see it.
- **Self-hosted (your own server):** everything goes into your
  Postgres database. We never see it.
- **Cloud version:** if we ever offer one, it'll use the same
  self-hosted stack on infrastructure we control, with the same
  privacy guarantees. This will be opt-in and clearly labelled.

We don't have analytics, third-party trackers, or ads anywhere in the
codebase. The only network calls the frontend makes are to its own
backend.

For a fuller report, see [SECURITY.md](SECURITY.md).

## Tech stack (for the curious)

| Layer    | What we use                                       |
| -------- | ------------------------------------------------- |
| Frontend | React 18, TypeScript 5, Vite 6, Tailwind 3        |
| Backend  | Python 3.12, FastAPI 0.115, SQLAlchemy 2          |
| Auth     | JWT (HS256) + bcrypt; ~20-attempt/min rate limit  |
| Database | PostgreSQL 15 in Docker; SQLite works for dev     |
| Deploy   | Static site to GitHub Pages; backend anywhere     |
| CI       | GitHub Actions: typecheck + lint + build + pytest |

## Contributing

Bug reports, scale translations, and design critiques are all very
welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow.

If you're a clinician and want to suggest a scale, please open an
issue first — we want to talk about licensing, norming, and cultural
fit before adding anything new.

## License

MIT — see [LICENSE](LICENSE). Use it commercially, fork it, ship it
under your own brand. We just ask for a link back somewhere in the
credits.

## Acknowledgements

The BFI was developed by Oliver P. John and Sanjay Srivastava. PSS-10
was developed by Sheldon Cohen. GAD-7 was developed by Robert L.
Spitzer and colleagues. The psychology here is theirs; the bugs are
ours.

---

_If something here helped you, we'd love to hear about it._
_If something is broken, please open an issue._

# Security Policy

## Supported Versions

| Version         | Supported          |
| --------------- | ------------------ |
| latest (master) | :white_check_mark: |
| older           | :x:                |

We only ship security fixes to the latest release line. Please make sure you
are on the latest commit on `master` before reporting an issue.

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security problems.**

Send a private report via one of these channels:

- GitHub: open a [security advisory](https://github.com/badhope/MindMirror/security/advisories/new)
- Email: see the GitHub profile of the maintainer for the current contact address

A good report includes:

- A clear description of the impact and reproduction steps
- The commit / version that introduced the issue (if known)
- A minimal proof-of-concept if possible
- Whether you intend to disclose publicly and on what timeline

We will:

1. Acknowledge within 72 hours
2. Triage and confirm within 7 days
3. Ship a fix as soon as practical, coordinated with you on disclosure

## Threat Model

MindMirror is a single-tenant web app that you can self-host with Docker.
In the default configuration:

- The frontend is served as static files by nginx on port 80.
- The FastAPI backend is only reachable inside the Docker network.
- PostgreSQL is only reachable inside the Docker network.
- JWTs are signed with HS256 using a `SECRET_KEY` you must provide.

Please make sure you:

- Set a strong, unique `SECRET_KEY` in `.env` (use `openssl rand -base64 64`).
- Do not expose the PostgreSQL or backend ports to the public internet.
- Put the nginx frontend behind HTTPS (Traefik, Caddy, Cloudflare, …) in
  production.
- Rotate the `SECRET_KEY` if you suspect it has leaked. Rotating the key
  invalidates all existing user sessions.

## Data Privacy

- The local "demo mode" in the browser stores accounts and results in
  `localStorage` only — nothing leaves your device.
- In the Docker deployment, all data lives in your own PostgreSQL container.
  Nothing is sent to third parties by the application itself.

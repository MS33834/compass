"""Helpers for third-party OAuth (currently just GitHub).

We keep two things out of the request handlers:

  - ``OAuthStateToken`` — a small signed JWT that ties a `state` value
    to a `provider` + `nonce`. The SPA receives it in the
    ``/authorize`` response, the user carries it through the provider's
    redirect, and we re-verify it on the ``/callback`` call. This is
    the CSRF protection the OAuth 2.0 spec requires.

  - ``fetch_github_user`` — turns a one-shot `code` into a
    `GitHubUserProfile` by calling GitHub's own APIs. We separate this
    from the FastAPI route so it's trivially mockable in tests.

Dev-mode note
-------------
When ``settings.MINDMIRROR_DEV_OAUTH`` is true (and we are NOT in
production), the ``/authorize`` route serves a tiny HTML shim that
pretends to be the GitHub consent screen. The shim posts a `code`
straight into the ``/callback`` route and the rest of the flow is
identical to the real one, which is what makes this safe to run in
test environments.
"""
from __future__ import annotations

import logging
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import httpx
from jose import JWTError, jwt

from app.config import settings


logger = logging.getLogger("mindmirror.oauth")


_OAUTH_STATE_AUDIENCE = "mindmirror:oauth-state"
_OAUTH_STATE_TTL_SECONDS = 600  # 10 minutes is plenty for a human click


@dataclass(frozen=True)
class GitHubUserProfile:
    """Subset of GitHub's /user payload that we actually use."""

    id: int           # GitHub's stable user id (we use this as the dedup key)
    login: str        # username
    name: Optional[str]
    email: Optional[str]
    avatar_url: Optional[str]


@dataclass(frozen=True)
class OAuthStartResult:
    """Returned by ``start_oauth`` so the SPA knows where to send the browser."""

    authorization_url: str
    state: str


# ---------------------------------------------------------------------------
# State token (CSRF protection)
# ---------------------------------------------------------------------------


def mint_state(provider: str) -> str:
    """Return a short-lived signed token the SPA must echo back to /callback."""
    payload = {
        "aud": _OAUTH_STATE_AUDIENCE,
        "provider": provider,
        "nonce": secrets.token_urlsafe(16),
        "iat": datetime.now(tz=timezone.utc),
        "exp": datetime.now(tz=timezone.utc) + timedelta(seconds=_OAUTH_STATE_TTL_SECONDS),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_state(state: str, expected_provider: str) -> bool:
    """Return True iff `state` is a fresh, valid token for `expected_provider`."""
    if not state:
        return False
    try:
        payload = jwt.decode(
            state,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            audience=_OAUTH_STATE_AUDIENCE,
        )
    except JWTError as exc:
        logger.info("oauth state rejected (%s): %s", exc.__class__.__name__, exc)
        return False
    return payload.get("provider") == expected_provider


# ---------------------------------------------------------------------------
# Real GitHub flow
# ---------------------------------------------------------------------------


def build_github_authorize_url(state: str) -> str:
    """Build the URL the browser should be redirected to."""
    if not settings.GITHUB_CLIENT_ID:
        raise RuntimeError("GITHUB_CLIENT_ID is not configured")
    from urllib.parse import urlencode

    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        # We send the user back to the SPA, NOT the backend. The SPA's
        # /auth/callback route reads `?code=` from the URL and POSTs it
        # to the backend. This is the modern, secret-safe pattern
        # (the PKCE-friendly "Authorization Code with PKCE" flow, minus
        # PKCE for now since the SPA isn't strictly public).
        "redirect_uri": f"{settings.FRONTEND_URL.rstrip('/')}/auth/callback",
        # We request the user's primary email so we can match them
        # against an existing account. `read:user` is the minimum
        # scope that gives us id/login/name/avatar.
        "scope": "read:user user:email",
        "state": state,
        "allow_signup": "true",
    }
    return f"{settings.GITHUB_AUTHORIZE_URL}?{urlencode(params)}"


async def exchange_code_for_token(code: str) -> str:
    """Trade the one-shot `code` from GitHub for a long-lived access_token."""
    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        raise RuntimeError("GitHub OAuth credentials are not configured")
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            settings.GITHUB_TOKEN_URL,
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": f"{settings.FRONTEND_URL.rstrip('/')}/auth/callback",
            },
            headers={"Accept": "application/json"},
        )
    if resp.status_code != 200:
        logger.warning("github token exchange failed: %s %s", resp.status_code, resp.text[:200])
        raise RuntimeError(f"GitHub token exchange failed (HTTP {resp.status_code})")
    data = resp.json()
    if "access_token" not in data:
        raise RuntimeError(f"GitHub token exchange returned no access_token: {data!r}")
    return data["access_token"]


async def fetch_github_user(access_token: str) -> GitHubUserProfile:
    """Use an access_token to load the GitHub user's profile.

    The primary email is *not* in /user (it's only public if the user
    has chosen to display it). We fall back to /user/emails and pick
    the first verified + primary entry.
    """
    auth_headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "MindMirror-OAuth",
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        user_resp = await client.get(settings.GITHUB_USER_URL, headers=auth_headers)
        if user_resp.status_code != 200:
            raise RuntimeError(
                f"GitHub /user returned HTTP {user_resp.status_code}: {user_resp.text[:200]}"
            )
        user: dict[str, Any] = user_resp.json()

        email = user.get("email")
        if not email:
            emails_resp = await client.get(settings.GITHUB_EMAILS_URL, headers=auth_headers)
            if emails_resp.status_code == 200:
                for entry in emails_resp.json():
                    if entry.get("primary") and entry.get("verified"):
                        email = entry.get("email")
                        break
                if not email:
                    for entry in emails_resp.json():
                        if entry.get("verified"):
                            email = entry.get("email")
                            break
    if not email:
        # Without an email we cannot satisfy the User.email NOT NULL
        # constraint. Refuse to silently make something up.
        raise RuntimeError(
            "GitHub account has no public/verified email; "
            "MindMirror needs an email to create an account."
        )
    return GitHubUserProfile(
        id=int(user["id"]),
        login=str(user["login"]),
        name=user.get("name"),
        email=str(email),
        avatar_url=user.get("avatar_url"),
    )


# ---------------------------------------------------------------------------
# Dev-mode mock flow (MINDMIRROR_DEV_OAUTH=true, non-prod only)
# ---------------------------------------------------------------------------


def dev_oauth_enabled() -> bool:
    """Hard-disabled in production regardless of env-var value."""
    if settings.ENVIRONMENT.strip().lower() in {"production", "prod"}:
        return False
    return bool(settings.MINDMIRROR_DEV_OAUTH)


def mint_dev_code(provider: str, login: str) -> str:
    """The shim's 'consent' button POSTs back this code. It's NOT a
    real GitHub code; the ``/callback`` route detects the ``dev_``
    prefix and skips the GitHub API entirely."""
    # 16 random bytes is plenty for a non-secret, single-use code.
    # We use token_hex (not token_urlsafe) so the random segment is
    # guaranteed to be `[0-9a-f]+` — no underscores that would break
    # the split('_', 3) parser below.
    return f"dev_{provider}_{secrets.token_hex(8)}_{login[:32]}"


def parse_dev_code(code: str) -> Optional[tuple[str, str]]:
    """Return (provider, login) if `code` is a well-formed dev code, else None."""
    if not code or not code.startswith("dev_"):
        return None
    parts = code.split("_", 3)
    if len(parts) != 4:
        return None
    _, provider, _random_hex, login = parts
    # The random segment is always hex (mint_dev_code uses token_hex).
    if not _random_hex or any(c not in "0123456789abcdef" for c in _random_hex):
        return None
    return provider, login


def dev_authorize_html(provider: str, state: str) -> str:
    """Tiny self-contained HTML that pretends to be the GitHub consent screen."""
    # We deliberately keep this fully static (no JS) and POST the form
    # straight back to /api/v1/auth/oauth/{provider}/dev/grant which
    # redirects to the SPA callback. The state we received in the
    # query string is carried through untouched.
    safe_provider = provider.replace('"', "&quot;")
    safe_state = state.replace('"', "&quot;")
    return (
        "<!doctype html><html><head><meta charset='utf-8'>"
        "<title>MindMirror dev OAuth - GitHub</title>"
        "<style>"
        "body{font-family:system-ui,-apple-system,sans-serif;background:#0d1117;color:#e6edf3;"
        "display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}"
        ".card{background:#161b22;border:1px solid #30363d;border-radius:12px;padding:32px;"
        "max-width:420px;width:90%;box-shadow:0 20px 50px rgba(0,0,0,.5);}"
        "h1{font-size:20px;margin:0 0 6px;}"
        "p{color:#8b949e;font-size:14px;line-height:1.5;}"
        "label{display:block;font-size:12px;color:#8b949e;margin:16px 0 6px;}"
        "input{width:100%;padding:10px;background:#0d1117;border:1px solid #30363d;"
        "color:#e6edf3;border-radius:6px;font-size:14px;box-sizing:border-box;}"
        ".row{display:flex;gap:8px;margin-top:24px;}"
        "button{flex:1;padding:10px 14px;border-radius:6px;font-size:14px;cursor:pointer;"
        "border:1px solid #30363d;}"
        ".primary{background:#238636;border-color:#2ea043;color:#fff;}"
        ".cancel{background:transparent;color:#e6edf3;}"
        "small{display:block;margin-top:16px;color:#6e7681;font-size:11px;}"
        "</style></head><body><div class='card'>"
        "<h1>MindMirror dev OAuth &mdash; " + safe_provider + "</h1>"
        "<p>This screen stands in for the real <b>GitHub</b> consent page. "
        "It only renders when <code>MINDMIRROR_DEV_OAUTH=true</code> "
        "and ENVIRONMENT &ne; production. Clicking <b>Authorize</b> mints "
        "a fake code and redirects you back to the SPA exactly like the "
        "real flow would.</p>"
        f"<form method='POST' action='/api/v1/auth/oauth/{safe_provider}/dev/grant'>"
        f"<input type='hidden' name='state' value='{safe_state}'/>"
        "<label for='login'>GitHub username (for the mock account)</label>"
        "<input id='login' name='login' placeholder='octocat' value='octocat' required/>"
        "<div class='row'>"
        "<button class='cancel' type='button' onclick=\"location.href='/'\" >Cancel</button>"
        "<button class='primary' type='submit'>Authorize</button>"
        "</div><small>Provider: " + safe_provider + "</small></form></div></body></html>"
    )

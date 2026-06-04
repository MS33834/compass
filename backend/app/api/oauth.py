"""Third-party OAuth routes (currently GitHub).

The flow is the standard "Authorization Code" grant:

  1. SPA calls ``GET /api/v1/auth/oauth/{provider}/authorize`` — the
     backend returns ``{authorization_url, state}``. The SPA bounces
     the browser to ``authorization_url``.

  2. The user consents on the provider's site. The provider redirects
     the browser back to the SPA at ``{FRONTEND_URL}/auth/callback?
     code=...&state=...``.

  3. The SPA's ``/auth/callback`` route POSTs ``{code, state}`` to
     ``/api/v1/auth/oauth/{provider}/callback``. The backend validates
     the state (CSRF), exchanges the code for an access token, loads
     the user profile, and either finds an existing account or
     creates a new one. It returns a normal ``Token`` (JWT + user
     info) just like ``/auth/login`` does.

In dev mode (``MINDMIRROR_DEV_OAUTH=true`` and ENVIRONMENT != prod),
step 1's ``authorization_url`` points at our own
``/dev/authorize`` HTML shim, step 2 happens on the backend (form
POST to ``/dev/grant``), and step 3 skips GitHub entirely.
"""
from __future__ import annotations

import logging
from datetime import timedelta

from fastapi import APIRouter, Body, Depends, Form, HTTPException, Request, status
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import settings
from app.core.oauth import (
    OAuthStartResult,
    build_github_authorize_url,
    dev_authorize_html,
    dev_oauth_enabled,
    exchange_code_for_token,
    fetch_github_user,
    mint_dev_code,
    mint_state,
    parse_dev_code,
    verify_state,
)
from app.core.ratelimit import AUTH_LIMIT, limiter
from app.core.security import create_access_token, get_password_hash
from app.core.utils import generate_uuid
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import Token, UserResponse


logger = logging.getLogger("mindmirror.oauth.routes")
router = APIRouter()


# Map provider name -> handler. Keeping the dispatch table tiny now
# means we don't have to touch auth.py when we add Google next.
_PROVIDER_HANDLERS: dict[str, str] = {"github": "github"}


# ---------------------------------------------------------------------------
# 1. /authorize — returns the URL the SPA should redirect the browser to
# ---------------------------------------------------------------------------


class AuthorizeResponse(BaseModel):
    provider: str
    authorization_url: str
    state: str


@router.get("/oauth/{provider}/authorize", response_model=AuthorizeResponse)
@limiter.limit(AUTH_LIMIT)
async def authorize(request: Request, provider: str) -> AuthorizeResponse:
    if provider not in _PROVIDER_HANDLERS:
        raise HTTPException(status_code=404, detail="Unknown OAuth provider")
    if provider == "github" and not settings.GITHUB_CLIENT_ID and not dev_oauth_enabled():
        raise HTTPException(
            status_code=503,
            detail="GitHub login is not configured on this deployment.",
        )
    state = mint_state(provider)
    if provider == "github":
        if dev_oauth_enabled():
            # The shim is served by /dev/authorize below; the SPA will
            # bounce the browser there instead of to github.com.
            auth_url = f"/api/v1/auth/oauth/{provider}/dev/authorize?state={state}"
        else:
            auth_url = build_github_authorize_url(state)
    else:  # pragma: no cover — guarded by the 404 above
        auth_url = ""
    return AuthorizeResponse(provider=provider, authorization_url=auth_url, state=state)


# ---------------------------------------------------------------------------
# 1b. /dev/authorize — the fake "GitHub" consent screen
# ---------------------------------------------------------------------------


@router.get("/oauth/{provider}/dev/authorize", response_class=HTMLResponse)
async def dev_authorize(provider: str, state: str) -> HTMLResponse:
    """Render a self-contained GitHub consent shim.

    Only registered when ``MINDMIRROR_DEV_OAUTH`` is true. We double
    check the flag here in case the dev grant route is hit directly
    without going through ``/authorize`` (and so the shim returns 404
    in production even if the env-var was somehow left on).
    """
    if not dev_oauth_enabled() or provider not in _PROVIDER_HANDLERS:
        raise HTTPException(status_code=404, detail="Not found")
    if not state or not verify_state(state, provider):
        raise HTTPException(status_code=400, detail="Invalid or expired state")
    return HTMLResponse(content=dev_authorize_html(provider, state))


@router.post("/oauth/{provider}/dev/grant")
async def dev_grant(
    provider: str,
    state: str = Form(..., description="CSRF state token, must match the one returned by /authorize"),
    login: str = Form(..., description="Username for the mock GitHub account"),
) -> RedirectResponse:
    """The shim form POSTs here. We mint a dev code and bounce the
    browser to the SPA callback, identical to what GitHub would do.

    Accepts both ``application/x-www-form-urlencoded`` (the natural
    shape of an HTML <form> POST) and ``application/json`` (handy
    for unit tests).
    """
    if not dev_oauth_enabled() or provider not in _PROVIDER_HANDLERS:
        raise HTTPException(status_code=404, detail="Not found")
    if not verify_state(state, provider):
        raise HTTPException(status_code=400, detail="Invalid or expired state")
    safe_login = "".join(ch for ch in login if ch.isalnum() or ch in "-_")[:32] or "octocat"
    code = mint_dev_code(provider, safe_login)
    redirect = (
        f"{settings.FRONTEND_URL.rstrip('/')}/auth/callback"
        f"?provider={provider}&code={code}&state={state}"
    )
    return RedirectResponse(url=redirect, status_code=302)


# ---------------------------------------------------------------------------
# 3. /callback — SPA POSTs the code here, we return a normal Token
# ---------------------------------------------------------------------------


class OAuthCallbackRequest(BaseModel):
    code: str
    state: str


@router.post("/oauth/{provider}/callback", response_model=Token)
@limiter.limit(AUTH_LIMIT)
async def callback(
    request: Request,
    provider: str,
    payload: OAuthCallbackRequest,
    db: Session = Depends(get_db),
) -> Token:
    if provider not in _PROVIDER_HANDLERS:
        raise HTTPException(status_code=404, detail="Unknown OAuth provider")

    if not verify_state(payload.state, provider):
        # Same generic error whether the state is missing, expired,
        # forged, or for a different provider. Never leak which one.
        raise HTTPException(status_code=400, detail="Invalid or expired state")
    if not payload.code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    # ---- resolve the (provider, external_id) tuple ----
    if dev_oauth_enabled():
        parsed = parse_dev_code(payload.code)
        if not parsed or parsed[0] != provider:
            raise HTTPException(status_code=400, detail="Invalid dev code")
        dev_provider, dev_login = parsed
        from app.core.oauth import GitHubUserProfile

        # email uses .example (RFC 2606 reserved) so it can never
        # accidentally collide with a real address. The username has
        # a stable, deterministic suffix so the same dev_login always
        # resolves to the same account.
        profile = GitHubUserProfile(
            id=abs(hash(dev_login)) % (2**31),
            login=dev_login,
            name=dev_login.capitalize(),
            email=f"{dev_login}+{dev_provider}@dev.mindmirror.example",
            avatar_url=f"https://ui-avatars.com/api/?name={dev_login}&background=24292e&color=fff&size=128",
        )
    elif provider == "github":
        try:
            access_token = await exchange_code_for_token(payload.code)
            profile = await fetch_github_user(access_token)
        except RuntimeError as exc:
            logger.warning("github oauth exchange failed: %s", exc)
            raise HTTPException(status_code=502, detail="OAuth provider rejected the code") from exc
    else:  # pragma: no cover
        raise HTTPException(status_code=404, detail="Unknown OAuth provider")

    # ---- find or create the local user ----
    # We identify by the (provider, external_id) pair encoded into a
    # synthetic email: "<external_id>+<provider>@oauth.mindmirror.example"
    # for the real flow, or "<login>+<provider>@dev.mindmirror.example"
    # for the dev shim. Both keep the existing NOT NULL / UNIQUE
    # constraints on email satisfied without polluting real-looking
    # addresses.
    if dev_oauth_enabled() and parse_dev_code(payload.code) is not None:
        oauth_email = f"{profile.login}+{provider}@dev.mindmirror.example"
    else:
        oauth_email = f"{profile.id}+{provider}@oauth.mindmirror.example"
    user = db.query(User).filter(User.email == oauth_email).first()
    if user is None:
        # First-time OAuth login: create a guest-style account that
        # the user can later "upgrade" by setting a password (out of
        # scope for this PR; the SPA's /profile page exposes a
        # placeholder). The password hash is a random secret we never
        # give out — the only way in is via OAuth.
        user = User(
            id=generate_uuid(),
            email=oauth_email,
            username=_unique_username(db, profile.login or f"user_{profile.id}"),
            hashed_password=get_password_hash(generate_uuid() + generate_uuid()),
            avatar_url=profile.avatar_url,
            is_guest=False,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))


def _unique_username(db: Session, desired: str) -> str:
    """Return `desired` if free, else `desired`, `desired_1`, `desired_2`, ..."""
    import re

    base = re.sub(r"[^a-zA-Z0-9_]", "_", desired)[:32] or "user"
    candidate = base
    n = 1
    while db.query(User).filter(User.username == candidate).first() is not None:
        n += 1
        suffix = f"_{n}"
        candidate = (base[: 32 - len(suffix)] + suffix)
    return candidate

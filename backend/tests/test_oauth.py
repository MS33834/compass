"""End-to-end tests for the third-party OAuth flow.

We exercise the local dev-mode shim (MINDMIRROR_DEV_OAUTH=true) so
these tests don't need network access to github.com. The real GitHub
path is verified indirectly by the same `/callback` handler, and the
state-token / code-parse helpers are tested directly.
"""
from __future__ import annotations

# conftest.py already sets MINDMIRROR_DEV_OAUTH=true. We just need to
# make sure the cached Settings instance picked it up.
from app.config import Settings  # noqa: E402

import app.config as _cfg  # noqa: E402

_cfg.settings = Settings()

import pytest  # noqa: E402

# Re-import the module that captures `dev_oauth_enabled` at call time
# so the new settings object is consulted. (It reads `settings` from
# the module global at call time, so we just need to make sure the
# module-level constant is recomputed.)
from app.core import oauth as oauth_core  # noqa: E402
from app.main import app  # noqa: E402

from fastapi.testclient import TestClient  # noqa: E402

from app.database import get_db  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402
from app.database import Base  # noqa: E402


# ---------------------------------------------------------------------------
# State token unit tests
# ---------------------------------------------------------------------------


def test_state_round_trip():
    state = oauth_core.mint_state("github")
    assert oauth_core.verify_state(state, "github") is True
    assert oauth_core.verify_state(state, "google") is False  # wrong provider rejected


def test_state_rejects_tampering():
    state = oauth_core.mint_state("github")
    # Flip a character in the *middle* of the payload (the second
    # segment is the JWT body; flipping a byte there is guaranteed to
    # break the HMAC regardless of what the random payload bytes
    # happen to be).
    head, payload, sig = state.split(".")
    flipped = payload[:5] + ("A" if payload[5] != "A" else "B") + payload[6:]
    tampered = ".".join([head, flipped, sig])
    assert oauth_core.verify_state(tampered, "github") is False


def test_state_rejects_empty():
    assert oauth_core.verify_state("", "github") is False
    assert oauth_core.verify_state("not-a-jwt", "github") is False


# ---------------------------------------------------------------------------
# Dev code unit tests
# ---------------------------------------------------------------------------


def test_dev_code_round_trip():
    code = oauth_core.mint_dev_code("github", "octocat")
    parsed = oauth_core.parse_dev_code(code)
    assert parsed == ("github", "octocat")


def test_dev_code_rejects_real_github_codes():
    assert oauth_core.parse_dev_code("abc123") is None
    assert oauth_core.parse_dev_code("") is None
    assert oauth_core.parse_dev_code("dev_only_two_parts") is None


# ---------------------------------------------------------------------------
# End-to-end: SPA → /authorize → dev shim → /callback → token
# ---------------------------------------------------------------------------


@pytest.fixture()
def oauth_client():
    """A TestClient with the dev OAuth shim enabled and a clean DB."""
    eng = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=eng)
    Session = sessionmaker(bind=eng)

    def _override_get_db():
        s = Session()
        try:
            yield s
        finally:
            s.close()

    app.dependency_overrides[get_db] = _override_get_db
    # Reset rate-limit counters between tests.
    from app.core.ratelimit import limiter

    limiter.reset()
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_authorize_returns_dev_shim_url_when_no_client_id(oauth_client):
    """Without GITHUB_CLIENT_ID set, /authorize should fall back to the
    in-process dev shim (rather than 503-ing)."""
    resp = oauth_client.get("/api/v1/auth/oauth/github/authorize")
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["provider"] == "github"
    assert "/api/v1/auth/oauth/github/dev/authorize" in body["authorization_url"]
    assert body["state"]  # non-empty


def test_dev_authorize_renders_consent_screen(oauth_client):
    # First mint a valid state via /authorize
    auth = oauth_client.get("/api/v1/auth/oauth/github/authorize").json()
    state = auth["state"]

    resp = oauth_client.get(
        f"/api/v1/auth/oauth/github/dev/authorize?state={state}",
        follow_redirects=False,
    )
    assert resp.status_code == 200
    assert "text/html" in resp.headers["content-type"]
    assert "GitHub" in resp.text
    assert "Authorize" in resp.text
    assert state in resp.text  # state carried through


def test_dev_authorize_rejects_bad_state(oauth_client):
    resp = oauth_client.get(
        "/api/v1/auth/oauth/github/dev/authorize?state=not-a-real-token",
        follow_redirects=False,
    )
    assert resp.status_code == 400


def test_dev_grant_redirects_to_spa_callback(oauth_client):
    auth = oauth_client.get("/api/v1/auth/oauth/github/authorize").json()
    state = auth["state"]

    resp = oauth_client.post(
        "/api/v1/auth/oauth/github/dev/grant",
        data={"state": state, "login": "octocat"},
        follow_redirects=False,
    )
    assert resp.status_code == 302
    location = resp.headers["location"]
    assert "/auth/callback" in location
    assert "provider=github" in location
    assert "state=" + state in location
    assert "code=dev_github_" in location


def test_dev_grant_rejects_bad_state(oauth_client):
    resp = oauth_client.post(
        "/api/v1/auth/oauth/github/dev/grant",
        data={"state": "fake", "login": "octocat"},
    )
    assert resp.status_code == 400


def test_callback_exchanges_code_for_jwt(oauth_client):
    """Full happy-path: authorize → dev/grant → callback → token."""
    auth = oauth_client.get("/api/v1/auth/oauth/github/authorize").json()
    state = auth["state"]

    grant = oauth_client.post(
        "/api/v1/auth/oauth/github/dev/grant",
        data={"state": state, "login": "octocat"},
        follow_redirects=False,
    )
    # Pull the code out of the redirect Location.
    from urllib.parse import urlparse, parse_qs

    qs = parse_qs(urlparse(grant.headers["location"]).query)
    code = qs["code"][0]

    # Now POST the code to /callback.
    resp = oauth_client.post(
        "/api/v1/auth/oauth/github/callback",
        json={"code": code, "state": state},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]  # JWT issued
    assert body["user"]["email"] == "octocat+github@dev.mindmirror.example"
    assert body["user"]["username"].startswith("octocat")
    assert body["user"]["is_active"] is True


def test_callback_creates_persistent_user(oauth_client):
    """The /callback endpoint should create a row in the users table."""
    from app.models.user import User
    from app.database import get_db

    auth = oauth_client.get("/api/v1/auth/oauth/github/authorize").json()
    state = auth["state"]
    grant = oauth_client.post(
        "/api/v1/auth/oauth/github/dev/grant",
        data={"state": state, "login": "newuser"},
        follow_redirects=False,
    )
    from urllib.parse import urlparse, parse_qs

    code = parse_qs(urlparse(grant.headers["location"]).query)["code"][0]
    resp = oauth_client.post(
        "/api/v1/auth/oauth/github/callback",
        json={"code": code, "state": state},
    )
    assert resp.status_code == 200
    body = resp.json()
    user_id = body["user"]["id"]
    assert body["user"]["email"] == "newuser+github@dev.mindmirror.example"

    # Verify the user is queryable in the same DB the test client wrote to.
    db_gen = app.dependency_overrides[get_db]()
    s = next(db_gen)
    try:
        u = s.query(User).filter(User.id == user_id).first()
        assert u is not None
        assert u.email == "newuser+github@dev.mindmirror.example"
        assert u.is_guest is False
        # Password hash is a random secret we never expose.
        assert u.hashed_password and u.hashed_password != "newuser"
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass


def test_callback_is_idempotent(oauth_client):
    """Logging in with the same dev_login twice returns the same user."""
    auth = oauth_client.get("/api/v1/auth/oauth/github/authorize").json()
    state = auth["state"]
    grant = oauth_client.post(
        "/api/v1/auth/oauth/github/dev/grant",
        data={"state": state, "login": "repeatable"},
        follow_redirects=False,
    )
    from urllib.parse import urlparse, parse_qs

    code = parse_qs(urlparse(grant.headers["location"]).query)["code"][0]

    r1 = oauth_client.post(
        "/api/v1/auth/oauth/github/callback", json={"code": code, "state": state}
    )
    # Second login needs a fresh authorize + grant (state is one-shot),
    # but the resulting user_id should be identical.
    auth2 = oauth_client.get("/api/v1/auth/oauth/github/authorize").json()
    state2 = auth2["state"]
    grant2 = oauth_client.post(
        "/api/v1/auth/oauth/github/dev/grant",
        data={"state": state2, "login": "repeatable"},
        follow_redirects=False,
    )
    code2 = parse_qs(urlparse(grant2.headers["location"]).query)["code"][0]
    r2 = oauth_client.post(
        "/api/v1/auth/oauth/github/callback", json={"code": code2, "state": state2}
    )
    assert r1.status_code == 200
    assert r2.status_code == 200
    assert r1.json()["user"]["id"] == r2.json()["user"]["id"]


def test_callback_rejects_bad_state(oauth_client):
    resp = oauth_client.post(
        "/api/v1/auth/oauth/github/callback",
        json={"code": "dev_github_xxx_octocat", "state": "fake"},
    )
    assert resp.status_code == 400


def test_callback_rejects_missing_code(oauth_client):
    auth = oauth_client.get("/api/v1/auth/oauth/github/authorize").json()
    resp = oauth_client.post(
        "/api/v1/auth/oauth/github/callback",
        json={"code": "", "state": auth["state"]},
    )
    assert resp.status_code == 400


def test_unknown_provider_404(oauth_client):
    resp = oauth_client.get("/api/v1/auth/oauth/twitter/authorize")
    assert resp.status_code == 404


def test_jwt_from_oauth_works_for_protected_endpoints(oauth_client):
    """End-to-end: log in via the dev OAuth shim, then call /auth/me
    with the issued JWT to prove the token is real and accepted."""
    auth = oauth_client.get("/api/v1/auth/oauth/github/authorize").json()
    state = auth["state"]
    grant = oauth_client.post(
        "/api/v1/auth/oauth/github/dev/grant",
        data={"state": state, "login": "protectme"},
        follow_redirects=False,
    )
    from urllib.parse import urlparse, parse_qs

    code = parse_qs(urlparse(grant.headers["location"]).query)["code"][0]
    cb = oauth_client.post(
        "/api/v1/auth/oauth/github/callback", json={"code": code, "state": state}
    ).json()
    token = cb["access_token"]

    me = oauth_client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert me.status_code == 200, me.text
    assert me.json()["email"] == "protectme+github@dev.mindmirror.example"

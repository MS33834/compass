#!/usr/bin/env python3
"""Start the API server for local development.

Usage:
    python run.py                # use default config
    python run.py --reload       # enable hot reload
    PORT=9000 python run.py      # custom port
"""
import os
import sys
import subprocess

os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.getcwd())


def get_default_database_url() -> str:
    if os.path.exists("/.dockerenv") or os.environ.get("DOCKER_CONTAINER"):
        # In docker, prefer env vars set by docker-compose (POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB)
        user = os.environ.get("POSTGRES_USER", "postgres")
        pw = os.environ.get("POSTGRES_PASSWORD", "REPLACE_ME")
        db = os.environ.get("POSTGRES_DB", "mental_health_db")
        return f"postgresql://{user}:{pw}@postgres:5432/{db}"
    return "sqlite:///./mental_health.db"


def get_default_secret_key() -> str:
    if os.path.exists("/.dockerenv") or os.environ.get("DOCKER_CONTAINER"):
        return "REPLACE_ME_WITH_RANDOM_SECRET_AT_LEAST_32_CHARS"
    return "REPLACE_ME_WITH_RANDOM_SECRET_AT_LEAST_32_CHARS"


os.environ.setdefault("DATABASE_URL", get_default_database_url())
os.environ.setdefault("SECRET_KEY", get_default_secret_key())
os.environ.setdefault("CORS_ORIGIN", "*")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    host = os.environ.get("HOST", "0.0.0.0")
    reload = "--reload" in sys.argv

    cmd = [
        sys.executable, "-m", "uvicorn", "app.main:app",
        "--host", host, "--port", str(port),
    ]
    if reload:
        cmd.append("--reload")

    print(f"Starting: {' '.join(cmd)}")
    print(f"  DB:    {os.environ.get('DATABASE_URL')}")
    print(f"  CORS:  {os.environ.get('CORS_ORIGIN')}")
    print(f"  Docs:  http://{host}:{port}/docs")
    print()
    subprocess.run(cmd, check=True)

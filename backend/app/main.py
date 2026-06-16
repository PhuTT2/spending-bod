"""FastAPI entrypoint.

Dev: this process only serves /api/*; Vite's dev server (port 3000) proxies
/api to here (port 8000) — see vite.config.ts.
Prod: this process serves /api/* AND the built frontend (dist/) on one port,
so deployment is a single process again, same as the original Express setup.
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import ENV, REPO_ROOT
from .routers import profile, proposals

app = FastAPI(title="Hỏi HĐQT Tài Chính API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile.router)
app.include_router(proposals.router)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


_dist = REPO_ROOT / "dist"
if ENV == "production" and _dist.is_dir():
    app.mount("/", StaticFiles(directory=str(_dist), html=True), name="frontend")

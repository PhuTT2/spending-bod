"""In-memory persistence. Single-process, resets on restart — matches the
original MVP scope (no Postgres/Redis wired up yet, per ARCHITECTURE.md's own
"future infrastructure" framing). The only thing worth getting right at this
stage is that writes are validated (Pydantic), not a raw dict spread.

Swapping this for a real database later means replacing this module only —
routers call get_state()/save_state() and never touch storage directly.
"""
from __future__ import annotations

import math
from datetime import datetime, timedelta, timezone

from .config import get_rules
from .models import UserState

_state = UserState()

# Cooldown bookkeeping. Keyed by user_id for forward-compatibility, even
# though today there is exactly one effective user (no real auth yet).
_reject_log: dict[str, list[datetime]] = {}
_locked_until: dict[str, datetime] = {}


def get_state() -> UserState:
    return _state


def save_state(new_state: UserState) -> UserState:
    global _state
    _state = new_state
    return _state


def check_cooldown(user_id: str) -> tuple[bool, int]:
    """Returns (is_locked, minutes_remaining)."""
    now = datetime.now(timezone.utc)
    locked_until = _locked_until.get(user_id)
    if locked_until and now < locked_until:
        return True, math.ceil((locked_until - now).total_seconds() / 60)
    if locked_until and now >= locked_until:
        _locked_until.pop(user_id, None)
        _reject_log.pop(user_id, None)
    return False, 0


def register_outcome(user_id: str, blocked: bool) -> None:
    """blocked = the proposal was delayed/rejected. Three blocks inside the
    rolling window locks new submissions for lock_minutes — and actually
    expires this time (the original Express version never lifted the lock)."""
    if not blocked:
        _reject_log.pop(user_id, None)
        _locked_until.pop(user_id, None)
        return

    rules = get_rules().get("cooldown", {})
    window = timedelta(hours=rules.get("window_hours", 24))
    now = datetime.now(timezone.utc)

    timestamps = [t for t in _reject_log.get(user_id, []) if now - t < window]
    timestamps.append(now)
    _reject_log[user_id] = timestamps

    if len(timestamps) >= rules.get("max_rejects_in_window", 3):
        _locked_until[user_id] = now + timedelta(minutes=rules.get("lock_minutes", 30))

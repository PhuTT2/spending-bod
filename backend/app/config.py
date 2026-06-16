"""Process-wide configuration: env vars and the path to the shared rules file.

The financial rules live in /config/financial_rules.json at the repo root —
shared, human-editable, not buried inside backend code (see ARCHITECTURE.md).
"""
from __future__ import annotations

import json
import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

# backend/app/config.py -> backend/app -> backend -> <repo root>
REPO_ROOT = Path(__file__).resolve().parents[2]
RULES_PATH = REPO_ROOT / "config" / "financial_rules.json"

load_dotenv(REPO_ROOT / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "").strip().lower()  # "fallback" forces the deterministic narrator
ENV = os.getenv("NODE_ENV", os.getenv("ENV", "development"))
PORT = int(os.getenv("PORT", "8000" if ENV != "production" else "3000"))

_DEFAULT_RULES = {
    "emergency_fund_months": 3,
    "ideal_emergency_fund_months": 6,
    "debt_warning_ratio": 0.35,
    "debt_reject_ratio": 0.5,
    "minimum_discipline_score_bnpl": 40,
    "minimum_income_bnpl": 3000000,
    "high_sanity_check_multiplier": 20,
    "default_fixed_expense_ratio": 0.35,
    "investment_liquidity_haircut": 0.5,
    "bnpl_installment_months": 3,
    "score_weights": {
        "affordability": 0.3,
        "liquidity": 0.25,
        "debt_burden": 0.2,
        "goal_alignment": 0.15,
        "discipline_fit": 0.1,
    },
    "health_score_weights": {
        "savings_ratio_cap": 45,
        "discipline_weight": 0.4,
        "compliance_weight": 0.15,
        "securities_bonus": 3,
        "savings_bonus": 2,
    },
    "cooldown": {"max_rejects_in_window": 3, "window_hours": 24, "lock_minutes": 30},
}


@lru_cache(maxsize=1)
def get_rules() -> dict:
    """Load financial_rules.json. Falls back to in-code defaults if missing/corrupt
    so the engine never hard-crashes on a bad config file."""
    try:
        return json.loads(RULES_PATH.read_text(encoding="utf-8"))
    except Exception:
        return _DEFAULT_RULES

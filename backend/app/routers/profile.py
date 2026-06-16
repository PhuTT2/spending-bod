"""Profile CRUD. Goal/challenge editing rides along here too — it's plain
data entry with no scoring math, so it doesn't need its own resource."""
from __future__ import annotations

from fastapi import APIRouter

from .. import store
from ..config import get_rules
from ..engine.profile import compute_health, compute_initial_discipline_score, compute_personality_label
from ..models import FinancialProfile, ProfileComputed, ProfileView, UserState

router = APIRouter(prefix="/api/profile", tags=["profile"])


def _build_view(state: UserState) -> ProfileView:
    rules = get_rules()
    health_score, health_label, health_description = compute_health(state.profile, state.history, rules)
    computed = ProfileComputed(
        personality_label=compute_personality_label(state.profile),
        health_score=health_score,
        health_label=health_label,
        health_description=health_description,
    )
    return ProfileView(onboarding_completed=state.onboarding_completed, profile=state.profile, computed=computed)


@router.get("", response_model=ProfileView)
def get_profile() -> ProfileView:
    return _build_view(store.get_state())


@router.put("", response_model=ProfileView)
def put_profile(new_state: UserState) -> ProfileView:
    saved = store.save_state(new_state)
    return _build_view(saved)


@router.post("/preview", response_model=ProfileComputed)
def preview_profile(draft: FinancialProfile) -> ProfileComputed:
    """Stateless preview used by onboarding step 4 — shows the CEO their
    starting personality/discipline score before they commit anything. No
    history exists yet at this point, so the initial discipline score is
    always derived from the draft's lifestyle inputs, not echoed back."""
    rules = get_rules()
    draft = draft.model_copy(update={"discipline_score": compute_initial_discipline_score(draft)})
    health_score, health_label, health_description = compute_health(draft, [], rules)
    return ProfileComputed(
        personality_label=compute_personality_label(draft),
        health_score=health_score,
        health_label=health_label,
        health_description=health_description,
    )

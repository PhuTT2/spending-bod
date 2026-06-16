"""Proposal lifecycle: evaluate (pure engine, AI-independent) → debate (engine
+ optional AI narration) → resolve (apply the CEO's obey/defy choice).

/evaluate is the seam a GreenNode AgentBase agent plugs into later: it is a
plain deterministic function call over HTTP, no AI dependency, no side
effects, no cooldown gate."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException

from .. import store
from ..config import get_rules
from ..engine.decisions import resolve_user_decision
from ..engine.scoring import evaluate as run_evaluation
from ..models import (
    DebateResponse,
    DecisionRecord,
    EvaluationResult,
    ProposalInput,
    ResolveDecisionInput,
    UserState,
    now_iso,
)
from ..narration import get_provider

router = APIRouter(prefix="/api/proposals", tags=["proposals"])

_DEFAULT_USER_ID = "default"


@router.post("/evaluate", response_model=EvaluationResult)
def evaluate_proposal(proposal: ProposalInput) -> EvaluationResult:
    state = store.get_state()
    return run_evaluation(proposal, state.profile, get_rules())


@router.post("/debate", response_model=DebateResponse)
async def debate_proposal(proposal: ProposalInput) -> DebateResponse:
    is_locked, minutes_remaining = store.check_cooldown(_DEFAULT_USER_ID)
    if is_locked:
        raise HTTPException(
            status_code=429,
            detail={
                "message": "HĐQT đề nghị tạm ngưng đệ trình, hãy bình tâm rà soát lại tài chính.",
                "remaining_minutes": minutes_remaining,
            },
        )

    state = store.get_state()
    evaluation = run_evaluation(proposal, state.profile, get_rules())

    provider = get_provider()
    narration = await provider.generate_board_narration(evaluation, proposal, state.profile.display_name)

    store.register_outcome(_DEFAULT_USER_ID, blocked=evaluation.decision in ("delay", "reject"))

    return DebateResponse(narration=narration, evaluation=evaluation)


@router.post("/resolve", response_model=UserState)
def resolve_proposal(payload: ResolveDecisionInput) -> UserState:
    state = store.get_state()
    score_change, new_score, new_cash_balance, _spent = resolve_user_decision(
        payload.evaluation,
        payload.user_action,
        state.profile.discipline_score,
        state.profile.cash_balance,
        payload.amount,
    )

    record = DecisionRecord(
        id=f"hist_{uuid.uuid4().hex[:10]}",
        timestamp=now_iso(),
        proposal_name=payload.proposal_name,
        amount=payload.amount,
        context=payload.context,
        user_action=payload.user_action,
        score_change=score_change,
        previous_score=state.profile.discipline_score,
        new_score=new_score,
        approved=payload.narration.conclusion.approved,
        summary=payload.narration.conclusion.summary,
        votes=payload.narration.votes,
        action_plan=payload.evaluation.action_plan,
    )

    updated_profile = state.profile.model_copy(update={"discipline_score": new_score, "cash_balance": new_cash_balance})
    new_state = state.model_copy(update={"profile": updated_profile, "history": [record, *state.history]})
    return store.save_state(new_state)

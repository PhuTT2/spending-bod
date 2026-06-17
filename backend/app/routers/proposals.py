"""Proposal lifecycle: evaluate (pure engine, AI-independent) → debate (engine
+ optional AI narration) → resolve (apply the CEO's obey/defy choice).

/evaluate is the seam a GreenNode AgentBase agent plugs into later: it is a
plain deterministic function call over HTTP, no AI dependency, no side
effects, no cooldown gate."""
from __future__ import annotations

import uuid

import json

from fastapi import APIRouter, HTTPException

from .. import store
from ..config import get_rules
from ..engine.decisions import resolve_user_decision
from ..engine.scoring import evaluate as run_evaluation
from ..models import (
    DebateResponse,
    DecisionRecord,
    EvaluationResult,
    ProfileView,
    ProposalInput,
    ResolveDecisionInput,
    SmartTip,
    SmartTipsRequest,
    SmartTipsResponse,
    now_iso,
)
from ..narration import get_provider
from .profile import build_view

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


@router.post("/resolve", response_model=ProfileView)
def resolve_proposal(payload: ResolveDecisionInput) -> ProfileView:
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
    saved = store.save_state(new_state)
    return build_view(saved)


_TRAVEL_SITES = (
    "Traveloka: https://www.traveloka.com/vi-vn/search/flight | "
    "Agoda: https://www.agoda.com/vi-vn | "
    "Booking.com: https://www.booking.com/index.vi.html | "
    "Vietnam Airlines: https://www.vietnamairlines.com/vn/vi/home | "
    "Vietjet: https://www.vietjetair.com/vi | "
    "Klook: https://www.klook.com/vi"
)

_ENTERTAINMENT_SITES = (
    "CGV: https://www.cgv.vn | "
    "Lotte Cinema: https://www.lottecinemavn.com | "
    "Galaxy Cinema: https://www.galaxycine.vn | "
    "Cinestar: https://www.cinestar.com.vn | "
    "Ticketbox: https://ticketbox.vn | "
    "Shopee Tickets: https://shopee.vn/m/shopeetickets"
)

_SMART_TIPS_PROMPT = """Bạn là chuyên gia tối ưu chi tiêu cho người Việt trẻ.

Đề xuất: "{proposal_name}"
Ngân sách: {amount_fmt} VND
Danh mục: {category_label}

Nền tảng được dùng ({category_label}):
{sites}

Nhiệm vụ: phân bổ ngân sách thành 4-5 hạng mục chi tiêu cụ thể. Tổng các amount trong tips nên xấp xỉ ngân sách trên.

Trả về JSON hợp lệ, KHÔNG thêm text ngoài JSON:
{{
  "savings_pct": <số nguyên 10-25, % tiết kiệm ước tính so với không có kế hoạch>,
  "savings_note": "<1 câu tip tiết kiệm tổng quát, ví dụ: Đặt trước 2 tuần có thể tiết kiệm đến 20% vé>",
  "tips": [
    {{
      "item": "<tên hạng mục ngắn gọn, ví dụ: Vé máy bay>",
      "amount": <số tiền VND, không có dấu phẩy>,
      "url": "<link đặt/mua từ danh sách nền tảng ở trên>",
      "note": "<tip cụ thể cho hạng mục này, tối đa 10 từ>"
    }}
  ]
}}"""


def _get_followup_client():
    from ..config import FOLLOWUP_API_KEY, FOLLOWUP_BASE_URL, FOLLOWUP_MODEL
    if not FOLLOWUP_API_KEY or not FOLLOWUP_BASE_URL or not FOLLOWUP_MODEL:
        raise HTTPException(status_code=503, detail="LLM not configured")
    from openai import AsyncOpenAI
    return AsyncOpenAI(api_key=FOLLOWUP_API_KEY, base_url=FOLLOWUP_BASE_URL), FOLLOWUP_MODEL


@router.post("/smart-tips", response_model=SmartTipsResponse)
async def get_smart_tips(req: SmartTipsRequest) -> SmartTipsResponse:
    client, model = _get_followup_client()
    category_label = "Du lịch" if req.category == "travel" else "Giải trí"
    sites = _TRAVEL_SITES if req.category == "travel" else _ENTERTAINMENT_SITES
    amount_fmt = f"{req.amount:,.0f}".replace(",", ".")
    prompt = _SMART_TIPS_PROMPT.format(
        proposal_name=req.proposal_name,
        amount_fmt=amount_fmt,
        category_label=category_label,
        sites=sites,
    )
    try:
        resp = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.6,
        )
        data = json.loads(resp.choices[0].message.content or "{}")
        return SmartTipsResponse(
            savings_pct=int(data.get("savings_pct", 15)),
            savings_note=data.get("savings_note", ""),
            tips=[
                SmartTip(
                    item=t.get("item", ""),
                    amount=float(t.get("amount", 0)),
                    url=str(t.get("url", "")),
                    note=t.get("note", ""),
                )
                for t in data.get("tips", [])
            ],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

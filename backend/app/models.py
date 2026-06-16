"""Pydantic contract shared by every router. This is the API the frontend
(and, later, a GreenNode AgentBase agent) talks to — keep it explicit and
typed instead of passing raw dicts around.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, Field

RiskTolerance = Literal["low", "medium", "high"]
Decision = Literal["approve", "approve_with_conditions", "delay", "reject"]
RiskLevel = Literal["low", "medium", "high"]
UserAction = Literal["obeyed", "defied"]
FinancialIntent = Literal[
    "Consumption",
    "Experience Spending",
    "Human Capital Investment",
    "Asset Accumulation",
    "Capital Preservation",
    "Risk Protection",
    "Debt Financing",
]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Financial profile (the user's standing baseline)
# ---------------------------------------------------------------------------


class LifestylePreference(BaseModel):
    travel: int = Field(3, ge=1, le=5)
    shopping: int = Field(3, ge=1, le=5)
    entertainment: int = Field(3, ge=1, le=5)
    saving: int = Field(3, ge=1, le=5)
    investing: int = Field(3, ge=1, le=5)
    safety: int = Field(3, ge=1, le=5)


class BnplHolding(BaseModel):
    has: bool = False
    limit: float = Field(0, ge=0)
    provider: Optional[str] = None


class SavingsHolding(BaseModel):
    has: bool = False
    balance: float = Field(0, ge=0)


class SecuritiesHolding(BaseModel):
    has: bool = False
    balance: float = Field(0, ge=0)


class LifeInsuranceHolding(BaseModel):
    has: bool = False
    premium: float = Field(0, ge=0)


class NonLifeInsuranceHolding(BaseModel):
    has: bool = False
    name: Optional[str] = None


class ProductHoldings(BaseModel):
    bnpl: BnplHolding = BnplHolding()
    savings: SavingsHolding = SavingsHolding()
    securities: SecuritiesHolding = SecuritiesHolding()
    life_insurance: LifeInsuranceHolding = LifeInsuranceHolding()
    non_life_insurance: NonLifeInsuranceHolding = NonLifeInsuranceHolding()


class Goal(BaseModel):
    goal_id: str
    title: str
    target_amount: float = Field(gt=0)
    current_amount: float = Field(0, ge=0)
    deadline: str


class FinancialProfile(BaseModel):
    user_id: str = "anonymous"
    display_name: str = "Sếp Tổng"
    monthly_income: float = Field(0, ge=0)
    # Optional on input: when omitted, the engine derives it from income via
    # default_fixed_expense_ratio in financial_rules.json (single source of
    # truth — no more "income * 0.35" vs "income * 0.3" drift across screens).
    monthly_fixed_expenses: Optional[float] = Field(None, ge=0)
    cash_balance: float = Field(0, ge=0)
    investments_balance: float = Field(0, ge=0)
    risk_tolerance: RiskTolerance = "medium"
    lifestyle_preference: LifestylePreference = LifestylePreference()
    product_holdings: ProductHoldings = ProductHoldings()
    active_goals: list[Goal] = []
    discipline_score: int = Field(80, ge=0, le=100)
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class ProfileComputed(BaseModel):
    """Derived fields the engine computes — never duplicated client-side."""

    personality_label: str
    health_score: int
    health_label: str
    health_description: str


class ProfileView(BaseModel):
    onboarding_completed: bool
    profile: FinancialProfile
    computed: ProfileComputed


# ---------------------------------------------------------------------------
# Decision record (history) + gamification state that rides along with profile
# ---------------------------------------------------------------------------


class DecisionRecord(BaseModel):
    id: str
    timestamp: str
    proposal_name: str
    amount: float
    context: str
    user_action: UserAction
    score_change: int
    previous_score: int
    new_score: int
    approved: bool
    summary: str
    votes: list["MemberVote"] = []
    action_plan: list["ActionPlanStep"] = []


class Challenge(BaseModel):
    id: str
    name: str
    description: str
    reward_points: int
    emoji: str
    status: Literal["available", "active", "completed", "failed"]
    target_value: float
    current_value: float
    type: Literal["no_spend", "limit_spending", "saving_target", "custom"]
    is_custom: bool = False
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    history_log: list[str] = []


class UserState(BaseModel):
    """The single document the frontend persists. Goal/challenge CRUD is plain
    data editing (no scoring math involved) so it rides along here instead of
    needing its own resource — only proposal evaluation/decision math gets a
    dedicated engine endpoint."""

    onboarding_completed: bool = False
    profile: FinancialProfile = FinancialProfile()
    history: list[DecisionRecord] = []
    challenges: list[Challenge] = []
    unlocked_badge_ids: list[str] = []


# ---------------------------------------------------------------------------
# Proposal evaluation (the deterministic engine's input/output)
# ---------------------------------------------------------------------------


class ProposalInput(BaseModel):
    proposal_name: str = Field(min_length=1)
    amount: float = Field(gt=0)
    context: str = ""
    # Explicit signals from the form. When present, the engine trusts them
    # over its own regex guess instead of silently overriding the user.
    intent_hint: Optional[str] = None
    timing: Optional[str] = None


class ReasonBullet(BaseModel):
    dimension: str
    summary: str
    impact: Literal["low", "medium", "high"]


class IntentResult(BaseModel):
    financial_intent: FinancialIntent
    confidence: float
    reasoning: str


class Scores(BaseModel):
    affordability: int
    liquidity: int
    debt_burden: int
    goal_alignment: int
    discipline_fit: int
    overall: int


class FinancialImpact(BaseModel):
    cash_gap: float
    estimated_months_to_afford: int
    estimated_monthly_payment: float
    remaining_emergency_fund: float


class ActionPlanStep(BaseModel):
    step: int
    action: str
    amount: Optional[float] = None
    duration_month: Optional[int] = None
    description: str = ""


class GoalImpact(BaseModel):
    goal: str
    current_progress: int
    new_progress: int
    impact: Literal["positive", "negative", "neutral"]


class ProductRecommendation(BaseModel):
    product_id: str
    product_name: str
    category: str
    why_this_product: str
    tradeoff_summary: str
    cta_text: str
    cta_url: str


class FutureSimulation(BaseModel):
    scenario_a: str
    scenario_b: str
    impact_summary: str


class EvaluationResult(BaseModel):
    """Pure, deterministic output of the rule engine. No AI involved in
    producing any field here — this is what an automated agent would call
    /api/proposals/evaluate to get."""

    evaluation_id: str
    decision: Decision
    risk_level: RiskLevel
    reason_codes: list[str]
    financial_intent: IntentResult
    scores: Scores
    explainability: list[ReasonBullet]
    financial_impact: FinancialImpact
    action_plan: list[ActionPlanStep]
    goal_impacts: list[GoalImpact]
    product_recommendation: ProductRecommendation
    future_simulation: FutureSimulation
    obey_reward: int
    defy_penalty: int
    evaluated_at: str = Field(default_factory=now_iso)


# ---------------------------------------------------------------------------
# Narration (the AI plug-in layer's output)
# ---------------------------------------------------------------------------


class DebateStep(BaseModel):
    member_id: str
    member_name: str
    quote: str


class MemberVote(BaseModel):
    member_id: str
    member_name: str
    vote: Literal["approve", "reject"]
    reason: str


class BoardConclusion(BaseModel):
    approved: bool
    summary: str


class NarrationResult(BaseModel):
    theme: str
    debate_steps: list[DebateStep]
    votes: list[MemberVote]
    conclusion: BoardConclusion
    provider: str
    model: str
    fallback_used: bool


class DebateResponse(BaseModel):
    narration: NarrationResult
    evaluation: EvaluationResult


# ---------------------------------------------------------------------------
# Resolving the user's obey/defy choice (also pure business logic — not AI)
# ---------------------------------------------------------------------------


class ResolveDecisionInput(BaseModel):
    proposal_name: str
    amount: float
    context: str = ""
    evaluation: EvaluationResult
    narration: NarrationResult
    user_action: UserAction


DecisionRecord.model_rebuild()

"""The deterministic rule engine. Pure functions only — no network calls, no
AI, no framework imports. This module must work standalone (e.g. in a unit
test or called directly by an agent) with zero dependency on the narration
layer. That separation is the whole point of the functional-first design.

Ported from the original decisionCore.ts, with these behavioral fixes versus
the original:
  1. The top-level liquidity score now reuses the exact same number as the
     explainability bullet, instead of being hardcoded to 100.
  2. overall score is a real weighted average (financial_rules.score_weights)
     instead of a hardcoded 80.
  3. `investments_balance` now actually counts toward the affordability /
     liquidity buffer (haircut-adjusted), instead of being accepted as input
     and silently ignored.
  4. Debt burden factors in an existing BNPL limit's implied installment,
     not just fixed_expenses / income.
  5. The per-branch discipline impact the engine computes is the one that
     actually gets returned and used (previously computed then discarded).
"""
from __future__ import annotations

import uuid

from ..models import (
    ActionPlanStep,
    EvaluationResult,
    FinancialImpact,
    FinancialProfile,
    FutureSimulation,
    GoalImpact,
    ProposalInput,
    ReasonBullet,
    Scores,
)
from .categories import detect_category, detect_intent
from .products import map_product


def _clamp(value: float, low: float = 0, high: float = 100) -> float:
    return max(low, min(high, value))


def liquid_assets(profile: FinancialProfile, rules: dict) -> float:
    """Cash plus a haircut-adjusted slice of investment holdings — investments
    are real money but less immediately spendable than cash on hand."""
    haircut = rules.get("investment_liquidity_haircut", 0.5)
    return profile.cash_balance + profile.investments_balance * haircut


def fixed_expenses(profile: FinancialProfile, rules: dict) -> float:
    if profile.monthly_fixed_expenses is not None:
        return profile.monthly_fixed_expenses
    return profile.monthly_income * rules.get("default_fixed_expense_ratio", 0.35)


def _liquidity_score(remaining: float, minimum: float, recommended: float) -> int:
    if remaining >= recommended:
        return 100
    if remaining >= minimum:
        return 65
    if remaining >= 0:
        return 35
    return 10


def _sanity_check_result(proposal: ProposalInput, reason: str) -> EvaluationResult:
    category = detect_category(proposal.proposal_name)
    product = map_product("reject", category, True, False, "Consumption")
    intent = detect_intent(proposal.proposal_name, proposal.context, category, proposal.intent_hint)
    return EvaluationResult(
        evaluation_id=f"eval_{uuid.uuid4().hex[:12]}",
        decision="reject",
        risk_level="high",
        reason_codes=["SANITY_CHECK_FAILED"],
        financial_intent=intent,
        scores=Scores(affordability=0, liquidity=0, debt_burden=0, goal_alignment=0, discipline_fit=0, overall=0),
        explainability=[ReasonBullet(dimension="Sanity check", summary=reason, impact="high")],
        financial_impact=FinancialImpact(
            cash_gap=proposal.amount, estimated_months_to_afford=999, estimated_monthly_payment=0, remaining_emergency_fund=0
        ),
        action_plan=[ActionPlanStep(step=1, action="delay_purchase", description="Đệ trình lại với số liệu hợp lý hơn.")],
        goal_impacts=[],
        product_recommendation=product,
        future_simulation=FutureSimulation(
            scenario_a="Số liệu đệ trình bất thường so với thu nhập/tiết kiệm hiện tại.",
            scenario_b="Kiểm tra lại số tiền và thu nhập trước khi trình lại.",
            impact_summary="HĐQT không thể thẩm định một con số phi lý.",
        ),
        obey_reward=15,
        defy_penalty=-15,
    )


def evaluate(proposal: ProposalInput, profile: FinancialProfile, rules: dict) -> EvaluationResult:
    if profile.monthly_income < 0 or profile.monthly_income > 10_000_000_000 or proposal.amount <= 0:
        return _sanity_check_result(proposal, "Số tiền hoặc thu nhập không hợp lệ.")

    is_insane = proposal.amount > profile.monthly_income * rules.get("high_sanity_check_multiplier", 20) or (
        proposal.amount > liquid_assets(profile, rules) and proposal.amount > profile.monthly_income * 2
    )
    if is_insane:
        return _sanity_check_result(proposal, "Số tiền đề xuất quá lớn so với thu nhập và tiết kiệm hiện tại.")

    category = detect_category(proposal.proposal_name)
    intent_result = detect_intent(proposal.proposal_name, proposal.context, category, proposal.intent_hint)
    intent = intent_result.financial_intent

    assets = liquid_assets(profile, rules)
    fixed = fixed_expenses(profile, rules)

    # --- Liquidity / emergency fund ---------------------------------------
    is_consumption = intent == "Consumption"
    is_investment_like = intent in ("Asset Accumulation", "Human Capital Investment", "Capital Preservation")
    efund_multiplier = 1.5 if is_consumption else (0.7 if is_investment_like else 1.0)
    minimum_efund = fixed * rules.get("emergency_fund_months", 3) * efund_multiplier
    recommended_efund = fixed * rules.get("ideal_emergency_fund_months", 6) * efund_multiplier
    efund_remaining = assets - proposal.amount
    liquidity_score = _liquidity_score(efund_remaining, minimum_efund, recommended_efund)

    # --- Debt burden (fixed costs + implied BNPL installment) -------------
    bnpl_installment = (
        profile.product_holdings.bnpl.limit / rules.get("bnpl_installment_months", 3)
        if profile.product_holdings.bnpl.has
        else 0
    )
    monthly_obligations = fixed + bnpl_installment
    dti = monthly_obligations / (profile.monthly_income or 1)
    debt_warning = rules.get("debt_warning_ratio", 0.35)
    debt_reject = rules.get("debt_reject_ratio", 0.5)
    debt_burden_score = _clamp(100 - dti * 100)

    # --- BNPL eligibility ---------------------------------------------------
    is_bnpl_eligible = (
        profile.monthly_income > rules.get("minimum_income_bnpl", 3_000_000)
        and dti < debt_reject
        and profile.discipline_score >= rules.get("minimum_discipline_score_bnpl", 40)
        and category != "investing"
    )

    # --- Affordability --------------------------------------------------
    affordability_score = _clamp(100 - (proposal.amount / (assets or 1)) * 100)

    # --- Goal alignment ---------------------------------------------------
    goal_score = 50.0
    lp = profile.lifestyle_preference
    if category == "travel" and lp.travel >= 4:
        goal_score += 30
    if category == "safety" and lp.safety >= 4:
        goal_score += 40
    if category == "investing" and lp.investing >= 4:
        goal_score += 40
    if is_investment_like or intent == "Risk Protection":
        goal_score = min(100, goal_score + 20)
    elif is_consumption:
        goal_score = max(0, goal_score - 20)

    # --- Decision branches --------------------------------------------------
    reason_codes: list[str] = []
    explainability: list[ReasonBullet] = []

    if proposal.amount > assets:
        decision, risk_level, branch_impact = "delay", "high", -15
        reason_codes.append("GAP_EXISTS_NEED_SAVING")
        explainability.append(ReasonBullet(
            dimension="Khả năng chi trả",
            summary=f"Số tiền vượt quá tài sản khả dụng ({assets:,.0f}đ).",
            impact="high",
        ))
    elif efund_remaining < minimum_efund and category not in ("safety", "saving"):
        decision, risk_level, branch_impact = "delay", "medium", -10
        reason_codes.append("EMERGENCY_FUND_AT_RISK")
        explainability.append(ReasonBullet(
            dimension="Quỹ khẩn cấp",
            summary=f"Sau giao dịch quỹ khẩn cấp còn {efund_remaining:,.0f}đ, dưới mức an toàn {minimum_efund:,.0f}đ.",
            impact="high",
        ))
    elif proposal.amount > assets * 0.4:
        risk_level = "medium"
        if is_bnpl_eligible:
            decision, branch_impact = "approve_with_conditions", -5
            reason_codes.append("USABLE_WITH_BNPL")
        else:
            decision, branch_impact = "delay", -10
            reason_codes.append("HIGH_PORTION_OF_SAVINGS")
        explainability.append(ReasonBullet(
            dimension="Khả năng chi trả",
            summary=f"Chiếm {(proposal.amount / assets * 100):.0f}% tài sản khả dụng.",
            impact="medium",
        ))
    else:
        decision, risk_level, branch_impact = "approve", "low", 5
        reason_codes.append("AFFORDABLE")
        explainability.append(ReasonBullet(
            dimension="Khả năng chi trả",
            summary="Số tiền nằm trong giới hạn an toàn của tài sản hiện có.",
            impact="low",
        ))

    if profile.discipline_score <= 40 and category == "shopping" and decision == "approve":
        decision = "approve_with_conditions"
        branch_impact = -5
        reason_codes.append("LOW_DISCIPLINE_WARNING")

    explainability.append(ReasonBullet(
        dimension="Nợ & chi phí cố định",
        summary=f"Tỷ lệ nghĩa vụ/thu nhập {dti * 100:.0f}% (cảnh báo {debt_warning * 100:.0f}%, từ chối {debt_reject * 100:.0f}%).",
        impact="high" if dti > debt_reject else ("medium" if dti > debt_warning else "low"),
    ))
    explainability.append(ReasonBullet(
        dimension="BNPL",
        summary="Đủ điều kiện trả sau." if is_bnpl_eligible else "Chưa đủ điều kiện trả sau (thu nhập/kỷ luật/nợ).",
        impact="low" if is_bnpl_eligible else "medium",
    ))
    explainability.append(ReasonBullet(
        dimension="Phù hợp mục tiêu sống",
        summary=f"Khoản này khớp với khẩu vị '{category}' ở mức {goal_score:.0f}/100.",
        impact="low" if goal_score >= 80 else "medium",
    ))

    # --- Aggregate scores ---------------------------------------------------
    weights = rules.get("score_weights", {})
    discipline_fit_score = float(profile.discipline_score)
    overall = (
        affordability_score * weights.get("affordability", 0.3)
        + liquidity_score * weights.get("liquidity", 0.25)
        + debt_burden_score * weights.get("debt_burden", 0.2)
        + goal_score * weights.get("goal_alignment", 0.15)
        + discipline_fit_score * weights.get("discipline_fit", 0.1)
    )

    scores = Scores(
        affordability=round(affordability_score),
        liquidity=round(liquidity_score),
        debt_burden=round(debt_burden_score),
        goal_alignment=round(goal_score),
        discipline_fit=round(discipline_fit_score),
        overall=round(_clamp(overall)),
    )

    # --- Obey/defy discipline deltas ----------------------------------------
    obey_reward = 15 if decision in ("delay", "reject") else 8
    defy_penalty = branch_impact if decision in ("delay", "reject") else -5

    cash_gap = max(0.0, proposal.amount - assets)
    action_plan = _generate_action_plan(decision, proposal.amount, assets, category, is_bnpl_eligible, rules)
    goal_impacts = _evaluate_goal_impacts(profile, proposal.amount, assets, decision, intent)
    product = map_product(decision, category, False, is_bnpl_eligible, intent)
    simulation = _generate_simulation(category)

    return EvaluationResult(
        evaluation_id=f"eval_{uuid.uuid4().hex[:12]}",
        decision=decision,
        risk_level=risk_level,
        reason_codes=reason_codes,
        financial_intent=intent_result,
        scores=scores,
        explainability=explainability[:5],
        financial_impact=FinancialImpact(
            cash_gap=cash_gap,
            estimated_months_to_afford=int((cash_gap / ((profile.monthly_income * 0.2) or 1)) + 0.999) if cash_gap else 0,
            estimated_monthly_payment=proposal.amount / rules.get("bnpl_installment_months", 3)
            if decision == "approve_with_conditions" and is_bnpl_eligible
            else 0,
            remaining_emergency_fund=max(0.0, efund_remaining),
        ),
        action_plan=action_plan,
        goal_impacts=goal_impacts,
        product_recommendation=product,
        future_simulation=simulation,
        obey_reward=obey_reward,
        defy_penalty=defy_penalty,
    )


def _generate_action_plan(
    decision: str, amount: float, assets: float, category: str, is_bnpl_eligible: bool, rules: dict
) -> list[ActionPlanStep]:
    plans: list[ActionPlanStep] = []
    if decision == "approve":
        plans.append(ActionPlanStep(step=1, action="purchase", amount=amount, description="Tiến hành thanh toán ngay bằng tiền mặt hiện có."))
        if assets > amount * 2:
            plans.append(ActionPlanStep(step=2, action="allocate_to_investment", description="Số dư còn rất tốt, cân nhắc trích thêm vào quỹ đầu tư dài hạn."))
    elif decision == "approve_with_conditions" and is_bnpl_eligible:
        months = rules.get("bnpl_installment_months", 3)
        plans.append(ActionPlanStep(step=1, action="use_bnpl", amount=amount, duration_month=months, description=f"Thanh toán bằng ví trả sau, chia làm {months} kỳ."))
        plans.append(ActionPlanStep(step=2, action="save_more", amount=amount / months, description="Thiết lập tiết kiệm tự động để trả đúng hạn mỗi kỳ."))
    elif decision == "delay":
        if category == "travel":
            plans.append(ActionPlanStep(step=1, action="travel_fund_contribution", amount=int(amount / 3) + 1, duration_month=3, description="Gửi tiết kiệm mục tiêu du lịch mỗi tháng."))
        else:
            plans.append(ActionPlanStep(step=1, action="delay_purchase", description="Trì hoãn quyết định này đến khi tài chính ổn định hơn."))
        plans.append(ActionPlanStep(step=2, action="save_more", amount=int(amount / 3) + 1, duration_month=3, description="Tăng thêm tiết kiệm hàng tháng."))
        if category in ("shopping", "entertainment"):
            plans.append(ActionPlanStep(step=3, action="switch_cheaper_option", description="Tìm lựa chọn rẻ hơn hoặc dùng voucher giảm giá."))
    elif decision == "reject":
        plans.append(ActionPlanStep(step=1, action="increase_emergency_fund", description="Ưu tiên bù đắp quỹ dự phòng đang thâm hụt."))
        plans.append(ActionPlanStep(step=2, action="save_more", amount=int(amount * 0.1), duration_month=6, description="Nếu vẫn muốn mua, tích lũy nhỏ giọt dài hơi hơn."))
    return plans


def _evaluate_goal_impacts(profile: FinancialProfile, amount: float, assets: float, decision: str, intent: str) -> list[GoalImpact]:
    impacts: list[GoalImpact] = []
    conflict_multiplier = 1.0
    if intent == "Consumption":
        conflict_multiplier = 1.2
    elif intent in ("Asset Accumulation", "Capital Preservation"):
        conflict_multiplier = 0.5

    for goal in profile.active_goals:
        current_progress = _clamp((goal.current_amount / goal.target_amount) * 100) if goal.target_amount else 0
        new_progress = current_progress
        impact = "neutral"

        if decision in ("approve", "approve_with_conditions"):
            remaining = assets - amount * conflict_multiplier
            if remaining < goal.current_amount:
                new_amount = max(0.0, remaining)
                new_progress = _clamp((new_amount / goal.target_amount) * 100) if goal.target_amount else 0
                impact = "negative"

        impacts.append(GoalImpact(
            goal=goal.title,
            current_progress=round(current_progress),
            new_progress=round(new_progress),
            impact=impact,  # type: ignore[arg-type]
        ))
    return impacts


_SIMULATIONS = {
    "travel": FutureSimulation(
        scenario_a="Đi ngay: quỹ dự phòng hao hụt mạnh, vài tháng sau phải thắt lưng buộc bụng.",
        scenario_b="Hoãn lại 3 tháng, tích lũy đủ tiền nhờ lãi suất kép rồi đi.",
        impact_summary="Trì hoãn một nhịp giúp chuyến đi nhẹ gánh hơn nhiều.",
    ),
    "shopping": FutureSimulation(
        scenario_a="Mua ngay làm dòng tiền mất tính linh hoạt.",
        scenario_b="Gửi tiết kiệm số tiền này, vài năm sau đủ mua gấp đôi.",
        impact_summary="Giữ dòng tiền khỏe mạnh quan trọng hơn một lần vui ngắn.",
    ),
    "entertainment": FutureSimulation(
        scenario_a="Mua ngay làm dòng tiền mất tính linh hoạt.",
        scenario_b="Gửi tiết kiệm số tiền này, vài năm sau đủ mua gấp đôi.",
        impact_summary="Giữ dòng tiền khỏe mạnh quan trọng hơn một lần vui ngắn.",
    ),
    "investing": FutureSimulation(
        scenario_a="Đầu tư ngay: có cơ hội nhân đôi tài sản dài hạn.",
        scenario_b="Để tiền nhàn rỗi: lạm phát ăn mòn vài % giá trị mỗi năm.",
        impact_summary="Chi phí cơ hội của việc chần chừ đầu tư là không nhỏ.",
    ),
}
_DEFAULT_SIMULATION = FutureSimulation(
    scenario_a="Không có lớp đệm an toàn, một sự cố bất ngờ sẽ buộc phải bán tháo tài sản.",
    scenario_b="Một lớp bảo vệ nhỏ giúp tránh cú sốc tài chính lớn.",
    impact_summary="Quản trị rủi ro trước, tận hưởng sau.",
)


def _generate_simulation(category: str) -> FutureSimulation:
    return _SIMULATIONS.get(category, _DEFAULT_SIMULATION)

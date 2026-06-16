"""Profile-derived computations: personality label, health score, initial
discipline score. These used to be duplicated (and drifting — two different
wordings of the same personality label, two different fixed-expense ratios)
across OnboardingFlow.tsx, UserProfileCard.tsx and DashboardTab.tsx. Now there
is exactly one implementation, and the frontend only ever displays what the
backend computed.
"""
from __future__ import annotations

from ..models import DecisionRecord, FinancialProfile

_PERSONALITY_LABELS = {
    "travel": "Chiến Thần Xê Dịch ✈️",
    "shopping": "Hán Tử Săn Deal Mua Sắm 🛍️",
    "entertainment": "Sứ Giả Giải Trí Hưởng Thụ 🍿",
    "saving": "Thủ Quỹ Tích Lũy Thép 🐷",
    "investing": "Cá Mập Đu Đỉnh Đầu Tư 📈",
    "safety": "Thánh Phòng Thủ Rủi Ro 🛡️",
}

_RISK_TIEBREAK = {
    "high": "Nhà Đầu Cơ Mạo Hiểm ⚡",
    "low": "CEO Phòng Thủ Cẩn Trọng 🏰",
    "medium": "Sếp Tổng Cân Bằng Trí Tuệ 🧠",
}


def compute_personality_label(profile: FinancialProfile) -> str:
    lp = profile.lifestyle_preference
    scored = [(name, getattr(lp, name)) for name in _PERSONALITY_LABELS]
    best_name, best_score = max(scored, key=lambda item: item[1])

    all_default = all(score == 3 for _, score in scored)
    if all_default:
        return _RISK_TIEBREAK.get(profile.risk_tolerance, _RISK_TIEBREAK["medium"])
    return _PERSONALITY_LABELS[best_name]


def compute_initial_discipline_score(profile: FinancialProfile) -> int:
    lp = profile.lifestyle_preference
    bnpl = profile.product_holdings.bnpl
    score = (
        lp.saving * 8
        + lp.safety * 6
        - (10 if bnpl.has and bnpl.limit > 10_000_000 else 0)
        - (8 if lp.shopping > 4 else 0)
        + 40
    )
    return int(max(40, min(100, round(score))))


def compute_health(profile: FinancialProfile, history: list[DecisionRecord], rules: dict) -> tuple[int, str, str]:
    weights = rules.get("health_score_weights", {})
    savings_ratio = profile.cash_balance / (profile.monthly_income or 1)
    savings_sub = min(weights.get("savings_ratio_cap", 45), (savings_ratio / 3) * weights.get("savings_ratio_cap", 45))
    discipline_sub = profile.discipline_score * weights.get("discipline_weight", 0.4)

    total = len(history)
    obeyed = sum(1 for h in history if h.user_action == "obeyed")
    compliance_rate = (obeyed / total * 100) if total else 100
    compliance_sub = compliance_rate * weights.get("compliance_weight", 0.15)

    holdings_bonus = (weights.get("securities_bonus", 3) if profile.product_holdings.securities.has else 0) + (
        weights.get("savings_bonus", 2) if profile.product_holdings.savings.has else 0
    )

    score = int(min(100, round(savings_sub + discipline_sub + compliance_sub + holdings_bonus)))

    if score >= 85:
        return score, "Thịnh Vượng Tối Ưu 👑", "Sức mạnh tài chính tuyệt hảo, duy trì đà này."
    if score >= 70:
        return score, "An Toàn Bền Vững 🛡️", "Tỷ lệ tích lũy tốt, bám sát kế hoạch."
    if score >= 50:
        return score, "Rủi Ro Nhẹ ⚠️", "Dòng tiền có dấu hiệu hụt hơi, nên thắt chặt chi tiêu ngẫu hứng."
    return score, "Khủng Hoảng Báo Động 🚨", "Ví tiền trống trải, cần cấp cứu ngân sách ngay."

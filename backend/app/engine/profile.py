"""Profile-derived computations: health score, initial discipline score."""
from __future__ import annotations

from ..models import DecisionRecord, FinancialProfile


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

"""Category + financial-intent classification.

Pure string heuristics — no AI involved. Ported from the original
decisionCore.ts with one fix: when the proposal form already tells us the
user's selected intent (intent_hint), we trust it instead of silently
overriding it with a regex guess that the user never sees.
"""
from __future__ import annotations

import re

from ..models import IntentResult

Category = str  # "travel" | "shopping" | "entertainment" | "saving" | "investing" | "safety"

_CATEGORY_PATTERNS: list[tuple[Category, re.Pattern]] = [
    ("travel", re.compile(r"du lịch|dulich|travel|vé máy bay|bay|khách sạn|resort|homestay|đi chơi|tour|đi thái|đi phú quốc|phượt", re.I)),
    ("entertainment", re.compile(r"phim|rạp|cgv|lotte|cinema|vé nhạc|concert|vé phim|ăn uống|buffet|nhà hàng|uống|trà sữa|nhậu|bia|karaoke|party", re.I)),
    ("investing", re.compile(r"vàng|chứng khoán|cổ phiếu|coin|crypto|invest|đầu tư|quỹ mở|đất|bất động sản|ổ số|vietlott", re.I)),
    ("safety", re.compile(r"bảo hiểm|sức khỏe|tai nạn|bhnt|y tế|phòng vệ", re.I)),
    ("saving", re.compile(r"tiết kiệm|heo đất|két|tích lũy|gửi ngân hàng", re.I)),
]

# Maps the explicit selector in NewProposalForm to the engine's intent enum.
_INTENT_HINT_MAP = {
    "Tiêu dùng": "Consumption",
    "Đầu tư": "Asset Accumulation",
    "Tiết kiệm": "Capital Preservation",
    "Du lịch": "Experience Spending",
    "Học tập": "Human Capital Investment",
    "Bảo vệ tài chính": "Risk Protection",
}

# Order matters: more specific patterns first so overlapping keywords
# (e.g. "tiết kiệm" appearing in both preservation and accumulation contexts)
# resolve predictably instead of one branch shadowing another.
_INTENT_PATTERNS: list[tuple[str, re.Pattern]] = [
    ("Risk Protection", re.compile(r"bảo hiểm|bảo vệ tài chính|phòng ngừa rủi ro", re.I)),
    ("Capital Preservation", re.compile(r"dự phòng|quỹ khẩn cấp|gửi tiền ngân hàng", re.I)),
    ("Human Capital Investment", re.compile(r"chứng chỉ|khóa học|học tiếng|máy tính|phục vụ công việc|kỹ năng", re.I)),
    ("Asset Accumulation", re.compile(r"etf|cổ phiếu|quỹ mở|vàng|chứng khoán|tiết kiệm|đầu tư", re.I)),
    ("Experience Spending", re.compile(r"du lịch|concert|trải nghiệm|nhật bản|đi chơi|vé|xem phim", re.I)),
    ("Debt Financing", re.compile(r"trả góp|vay|mượn|thẻ tín dụng|bnpl", re.I)),
]


def detect_category(proposal_name: str) -> Category:
    text = proposal_name.lower()
    for category, pattern in _CATEGORY_PATTERNS:
        if pattern.search(text):
            return category
    return "shopping"


def detect_intent(proposal_name: str, context: str, category: Category, intent_hint: str | None) -> IntentResult:
    if intent_hint and intent_hint in _INTENT_HINT_MAP:
        return IntentResult(
            financial_intent=_INTENT_HINT_MAP[intent_hint],  # type: ignore[arg-type]
            confidence=1.0,
            reasoning="CEO đã chọn trực tiếp ý định này khi đệ trình.",
        )

    text = f"{proposal_name} {context} {category}".lower()
    for intent, pattern in _INTENT_PATTERNS:
        if pattern.search(text):
            return IntentResult(
                financial_intent=intent,  # type: ignore[arg-type]
                confidence=0.7,
                reasoning=_REASONING_BY_INTENT[intent],
            )
    return IntentResult(
        financial_intent="Consumption",
        confidence=0.6,
        reasoning=_REASONING_BY_INTENT["Consumption"],
    )


_REASONING_BY_INTENT = {
    "Risk Protection": "Đề xuất mang tính phòng vệ, quản lý rủi ro và bảo vệ sức khỏe/tài chính.",
    "Capital Preservation": "Tập trung vào việc bảo toàn vốn và xây dựng quỹ dự phòng.",
    "Human Capital Investment": "Khoản đầu tư vào bản thân, công cụ làm việc hoặc kỹ năng mới giúp tăng thu nhập tương lai.",
    "Asset Accumulation": "Khoản chi nhằm mục đích tích lũy tài sản và sinh lời dài hạn.",
    "Experience Spending": "Khoản chi tập trung vào trải nghiệm, kỷ niệm và gắn kết tinh thần.",
    "Debt Financing": "Có dấu hiệu sử dụng đòn bẩy tài chính hoặc đi vay để tiêu dùng.",
    "Consumption": "Phân tích từ khoá cho thấy đây là chi tiêu tiêu sản thông thường.",
}

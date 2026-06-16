"""Deterministic, hardcoded narration used when no AI provider is configured
or the AI call fails. The board meeting must never simply crash."""
from __future__ import annotations

from ..models import DebateStep, EvaluationResult, MemberVote, NarrationResult, ProposalInput
from .base import NarrationProvider


class FallbackProvider(NarrationProvider):
    async def generate_board_narration(self, evaluation: EvaluationResult, proposal: ProposalInput, display_name: str) -> NarrationResult:
        is_approved = evaluation.decision in ("approve", "approve_with_conditions")
        vote = "approve" if is_approved else "reject"

        return NarrationResult(
            theme="Phán Quyết Khẩn Cấp (Hệ thống AI tạm vắng)",
            debate_steps=[
                DebateStep(member_id="cto", member_name="Giám Đốc Tích Lũy", quote="Hệ thống xử lý bằng thuật toán lõi, không qua tranh luận AI lần này."),
                DebateStep(member_id="chairman", member_name="Chủ Tịch HĐQT", quote="Phán quyết được ban hành trực tiếp từ engine. Không thương lượng!"),
            ],
            votes=[
                MemberVote(member_id="cto", member_name="Giám Đốc Tích Lũy", vote=vote, reason="Tuân thủ thuật toán."),
                MemberVote(member_id="chairman", member_name="Chủ Tịch HĐQT", vote=vote, reason="Phê duyệt theo đúng quy tắc cấu hình."),
            ],
            conclusion={
                "approved": is_approved,
                "summary": "Engine đã duyệt tự động. Chi tiêu cẩn thận." if is_approved else "Engine bác hồ sơ vì vượt giới hạn an toàn tài chính.",
            },
            provider="fallback",
            model="hardcoded",
            fallback_used=True,
        )

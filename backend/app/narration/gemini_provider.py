"""Gemini-backed narration provider. Optional — the app must work without it
(see fallback_provider.py). The engine result is treated as ground truth and
handed to the model only to be dramatized, never recalculated."""
from __future__ import annotations

import json

from pydantic import BaseModel

from ..config import GEMINI_API_KEY
from ..models import BoardConclusion, DebateStep, EvaluationResult, MemberVote, NarrationResult, ProposalInput
from .base import NarrationProvider

_MODEL_NAME = "gemini-3.5-flash"


class _GeminiNarrationSchema(BaseModel):
    theme: str
    debate_steps: list[DebateStep]
    votes: list[MemberVote]
    conclusion: BoardConclusion


def _format_vnd(amount: float) -> str:
    return f"{amount:,.0f}".replace(",", ".") + "đ"


def _build_prompt(evaluation: EvaluationResult, proposal: ProposalInput, display_name: str) -> str:
    goal_impacts = [g.model_dump() for g in evaluation.goal_impacts]
    return f"""Bạn là một hội đồng quản trị tài chính (Board of Directors) quản lý dòng tiền cá nhân của người dùng (CEO).
Nhiệm vụ: thuật lại một cuộc tranh luận tấu hài bám sát đúng quyết định đã được Rule Engine tính toán sẵn — KHÔNG được tự đổi số liệu hay quyết định.

Dữ liệu từ Rule Engine (sự thật tuyệt đối, không được mâu thuẫn):
- Đề xuất: "{proposal.proposal_name}" — số tiền {_format_vnd(proposal.amount)}
- Quyết định: {evaluation.decision.upper()}
- Bản chất tài chính: {evaluation.financial_intent.financial_intent} ({evaluation.financial_intent.reasoning})
- Rủi ro: {evaluation.risk_level.upper()}
- Tên CEO: {display_name}
- Lý do kỹ thuật: {", ".join(evaluation.reason_codes)}
- Tác động tới mục tiêu: {json.dumps(goal_impacts, ensure_ascii=False)}

Hướng dẫn giọng văn: tiếng Việt tự nhiên, GenZ, châm chọc sắc sảo nhưng thiết thực, hài hước kiểu cú Duolingo.
- Nếu có mục tiêu bị ảnh hưởng tiêu cực, phải nhắc tới nó để răn đe cụ thể.
- Chọn 3-4 trong 8 thành viên (chairman, cxo, cho, clo, luck_director, cto, cgo, cro, wallet) phù hợp nhất với bản chất tài chính ở trên để tranh luận.
- Soạn 4-5 lượt tranh luận (debate_steps), rồi toàn bộ 8 thành viên phải bỏ phiếu (votes) — vote chỉ được là "approve" hoặc "reject", không có giá trị khác.
- Nếu quyết định là APPROVE/APPROVE_WITH_CONDITIONS thì đa số phiếu phải approve; ngược lại đa số phải reject.
- conclusion.approved phải khớp với đa số phiếu và với quyết định của Rule Engine ở trên.

Trả về đúng schema JSON yêu cầu, không thêm văn bản ngoài JSON."""


class GeminiProvider(NarrationProvider):
    def __init__(self) -> None:
        if not GEMINI_API_KEY:
            raise RuntimeError("Missing GEMINI_API_KEY")
        from google import genai  # imported lazily so the package is optional at runtime

        self._client = genai.Client(api_key=GEMINI_API_KEY)

    async def generate_board_narration(self, evaluation: EvaluationResult, proposal: ProposalInput, display_name: str) -> NarrationResult:
        from google.genai import types

        prompt = _build_prompt(evaluation, proposal, display_name)
        response = self._client.models.generate_content(
            model=_MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=_GeminiNarrationSchema,
            ),
        )

        parsed = getattr(response, "parsed", None)
        data = parsed.model_dump() if isinstance(parsed, _GeminiNarrationSchema) else json.loads(response.text or "{}")

        return NarrationResult(
            theme=data["theme"],
            debate_steps=data["debate_steps"],
            votes=data["votes"],
            conclusion=data["conclusion"],
            provider="gemini",
            model=_MODEL_NAME,
            fallback_used=False,
        )

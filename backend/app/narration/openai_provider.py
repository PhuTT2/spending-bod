"""OpenAI-compatible narration provider — works with GreenNode AI Platform
(MaaS) and any other OpenAI-compatible endpoint.

Configure via env vars:
  LLM_BASE_URL  — e.g. https://maas-llm-aiplatform-hcm.api.vngcloud.vn/v1
  LLM_API_KEY   — API key for the endpoint
  LLM_MODEL     — model path, e.g. google/gemma-4-31b-it
"""
from __future__ import annotations

import json

from ..config import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL
from ..models import BoardConclusion, DebateStep, EvaluationResult, MemberVote, NarrationResult, ProposalInput
from .base import NarrationProvider


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

Trả về JSON hợp lệ theo schema sau, KHÔNG thêm text ngoài JSON:
{{
  "theme": "<string — chủ đề cuộc họp>",
  "debate_steps": [
    {{"member": "<tên thành viên>", "stance": "approve|reject|neutral", "speech": "<lời thoại>"}}
  ],
  "votes": [
    {{"member": "<tên>", "vote": "approve|reject", "reason": "<lý do ngắn>"}}
  ],
  "conclusion": {{
    "approved": true|false,
    "final_speech": "<lời tổng kết của chairman>"
  }}
}}"""


_SCHEMA = {
    "type": "object",
    "properties": {
        "theme": {"type": "string"},
        "debate_steps": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "member": {"type": "string"},
                    "stance": {"type": "string"},
                    "speech": {"type": "string"},
                },
                "required": ["member", "stance", "speech"],
            },
        },
        "votes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "member": {"type": "string"},
                    "vote": {"type": "string"},
                    "reason": {"type": "string"},
                },
                "required": ["member", "vote", "reason"],
            },
        },
        "conclusion": {
            "type": "object",
            "properties": {
                "approved": {"type": "boolean"},
                "final_speech": {"type": "string"},
            },
            "required": ["approved", "final_speech"],
        },
    },
    "required": ["theme", "debate_steps", "votes", "conclusion"],
}


class OpenAIProvider(NarrationProvider):
    def __init__(self) -> None:
        if not LLM_API_KEY or not LLM_BASE_URL or not LLM_MODEL:
            raise RuntimeError("Missing LLM_API_KEY, LLM_BASE_URL, or LLM_MODEL")
        from openai import AsyncOpenAI

        self._client = AsyncOpenAI(api_key=LLM_API_KEY, base_url=LLM_BASE_URL)
        self._model = LLM_MODEL

    async def generate_board_narration(self, evaluation: EvaluationResult, proposal: ProposalInput, display_name: str) -> NarrationResult:
        prompt = _build_prompt(evaluation, proposal, display_name)
        response = await self._client.chat.completions.create(
            model=self._model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.8,
        )

        raw = response.choices[0].message.content or "{}"
        data = json.loads(raw)

        return NarrationResult(
            theme=data.get("theme", "Phiên họp HĐQT"),
            debate_steps=data.get("debate_steps", []),
            votes=data.get("votes", []),
            conclusion=data.get("conclusion", {"approved": False, "final_speech": ""}),
            provider="openai-compatible",
            model=self._model,
            fallback_used=False,
        )

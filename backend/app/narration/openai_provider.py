"""OpenAI-compatible narration provider — works with GreenNode AI Platform
(MaaS) and any other OpenAI-compatible endpoint.

Configure via env vars:
  LLM_BASE_URL  — e.g. https://maas-llm-aiplatform-hcm.api.vngcloud.vn/v1
  LLM_API_KEY   — API key for the endpoint
  LLM_MODEL     — model path, e.g. google/gemma-4-31b-it
"""
from __future__ import annotations

import json

from ..config import LLM_API_KEY, LLM_BASE_URL, NARRATION_MODEL
from ..models import BoardConclusion, DebateStep, EvaluationResult, MemberVote, NarrationResult, ProposalInput  # noqa: F401
from .base import NarrationProvider


def _format_vnd(amount: float) -> str:
    return f"{amount:,.0f}".replace(",", ".") + "đ"


def _build_prompt(evaluation: EvaluationResult, proposal: ProposalInput, display_name: str, selected_members: list[str] | None = None) -> str:
    goal_impacts = [g.model_dump() for g in evaluation.goal_impacts]
    all_members = "chairman, cxo, cho, clo, luck_director, cto, cgo, cro, wallet"
    if selected_members and len(selected_members) > 0:
        debate_instruction = f"- Sử dụng ĐÚNG các thành viên sau trong phần debate_steps (không thêm, không bớt): {', '.join(selected_members)}. Soạn {len(selected_members) + 1}-{len(selected_members) + 2} lượt tranh luận."
    else:
        debate_instruction = f"- Chọn 3-4 trong 9 thành viên ({all_members}) phù hợp nhất với bản chất tài chính ở trên để tranh luận. Soạn 4-5 lượt tranh luận (debate_steps)."
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
{debate_instruction}
- Toàn bộ 9 thành viên ({all_members}) phải bỏ phiếu (votes) — vote chỉ được là "approve" hoặc "reject", không có giá trị khác.
- Nếu quyết định là APPROVE/APPROVE_WITH_CONDITIONS thì đa số phiếu phải approve; ngược lại đa số phải reject.
- conclusion.approved phải khớp với đa số phiếu và với quyết định của Rule Engine ở trên.

Trả về JSON hợp lệ theo schema sau, KHÔNG thêm text ngoài JSON:
{{
  "theme": "<string — chủ đề cuộc họp>",
  "debate_steps": [
    {{"member_id": "<id snake_case: chairman/cxo/cho/clo/luck_director/cto/cgo/cro/wallet>", "member_name": "<tên hiển thị vui>", "quote": "<lời thoại>"}}
  ],
  "votes": [
    {{"member_id": "<id snake_case>", "member_name": "<tên hiển thị>", "vote": "approve|reject", "reason": "<lý do ngắn>"}}
  ],
  "conclusion": {{
    "approved": true|false,
    "summary": "<lời tổng kết của chairman>"
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
        if not LLM_API_KEY or not LLM_BASE_URL or not NARRATION_MODEL:
            raise RuntimeError("Missing LLM_API_KEY, LLM_BASE_URL, or NARRATION_MODEL")
        from openai import AsyncOpenAI

        self._client = AsyncOpenAI(api_key=LLM_API_KEY, base_url=LLM_BASE_URL)
        self._model = NARRATION_MODEL

    async def generate_board_narration(self, evaluation: EvaluationResult, proposal: ProposalInput, display_name: str) -> NarrationResult:
        prompt = _build_prompt(evaluation, proposal, display_name, proposal.selected_members)
        response = await self._client.chat.completions.create(
            model=self._model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.8,
        )

        raw = response.choices[0].message.content or "{}"
        data = json.loads(raw)

        conclusion_raw = data.get("conclusion", {})
        return NarrationResult(
            theme=data.get("theme", "Phiên họp HĐQT"),
            debate_steps=[
                DebateStep(
                    member_id=s.get("member_id", "chairman"),
                    member_name=s.get("member_name", s.get("member_id", "Chairman")),
                    quote=s.get("quote", s.get("speech", "")),
                )
                for s in data.get("debate_steps", [])
            ],
            votes=[
                MemberVote(
                    member_id=v.get("member_id", "chairman"),
                    member_name=v.get("member_name", v.get("member_id", "Chairman")),
                    vote=v.get("vote", "reject"),
                    reason=v.get("reason", ""),
                )
                for v in data.get("votes", [])
            ],
            conclusion=BoardConclusion(
                approved=conclusion_raw.get("approved", False),
                summary=conclusion_raw.get("summary", conclusion_raw.get("final_speech", "")),
            ),
            provider="openai-compatible",
            model=self._model,
            fallback_used=False,
        )

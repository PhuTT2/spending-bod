"""AI-driven chat: follow-up question generation and general financial advice.

Uses FOLLOWUP_MODEL (defaults to LLM_MODEL) — intended to be DeepSeek V4 Pro
via GreenNode MaaS, separate from the narration model (Gemma).
"""
from __future__ import annotations

import json

from fastapi import APIRouter, HTTPException

from ..config import FOLLOWUP_API_KEY, FOLLOWUP_BASE_URL, FOLLOWUP_MODEL
from ..models import AdviceRequest, AdviceResponse, FollowupQuestion, FollowupRequest, FollowupResponse

router = APIRouter(prefix="/api/chat", tags=["chat"])


def _get_client():
    if not FOLLOWUP_API_KEY or not FOLLOWUP_BASE_URL or not FOLLOWUP_MODEL:
        raise HTTPException(status_code=503, detail="Chat LLM not configured (missing FOLLOWUP_* env vars)")
    from openai import AsyncOpenAI
    return AsyncOpenAI(api_key=FOLLOWUP_API_KEY, base_url=FOLLOWUP_BASE_URL), FOLLOWUP_MODEL


_FOLLOWUP_PROMPT = """Bạn là trợ lý tài chính thông minh, chuyên phân tích câu hỏi và xác định thông tin còn thiếu.

Người dùng ({display_name}) vừa hỏi: "{question}"

Nhiệm vụ:
1. Xác định loại câu hỏi: "spending" (muốn mua/chi tiêu gì đó), "advice" (tư vấn tài chính), hoặc "general"
2. Đưa ra 1-3 câu hỏi follow-up ngắn gọn để hiểu rõ hơn ngữ cảnh
3. Mỗi câu hỏi có thể kèm 2-4 lựa chọn nhanh (options), hoặc để trống nếu cần trả lời tự do

Trả về JSON theo schema, KHÔNG thêm text ngoài JSON:
{{
  "question_type": "spending|advice|general",
  "follow_up_questions": [
    {{
      "question": "<câu hỏi ngắn gọn, thân thiện>",
      "options": ["<lựa chọn 1>", "<lựa chọn 2>"]
    }}
  ]
}}"""

_ADVICE_PROMPT = """Bạn là cố vấn tài chính cá nhân của {display_name}, phong cách GenZ Việt Nam — thực tế, thẳng thắn, hài hước nhẹ.

Câu hỏi gốc: "{original_question}"
Thông tin bổ sung từ người dùng: {answers_text}

Nhiệm vụ:
- Đưa ra lời khuyên tài chính cụ thể, actionable
- Nếu liên quan đến một khoản chi cụ thể, ghi rõ tên khoản chi đó
- Tối đa 150 từ, không quá dài dòng

Trả về JSON:
{{
  "answer": "<lời khuyên tài chính>",
  "is_spending_related": true|false,
  "suggested_proposal_name": "<tên khoản chi nếu spending_related, null nếu không>"
}}"""


@router.post("/followup", response_model=FollowupResponse)
async def get_followup_questions(req: FollowupRequest) -> FollowupResponse:
    client, model = _get_client()
    prompt = _FOLLOWUP_PROMPT.format(display_name=req.display_name, question=req.question)
    try:
        resp = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.5,
        )
        data = json.loads(resp.choices[0].message.content or "{}")
        return FollowupResponse(
            question_type=data.get("question_type", "general"),
            follow_up_questions=[
                FollowupQuestion(
                    question=q.get("question", ""),
                    options=q.get("options", []),
                )
                for q in data.get("follow_up_questions", [])
            ],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/advice", response_model=AdviceResponse)
async def get_advice(req: AdviceRequest) -> AdviceResponse:
    client, model = _get_client()
    answers_text = "; ".join(req.answers) if req.answers else "Không có thêm thông tin"
    prompt = _ADVICE_PROMPT.format(
        display_name=req.display_name,
        original_question=req.original_question,
        answers_text=answers_text,
    )
    try:
        resp = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        data = json.loads(resp.choices[0].message.content or "{}")
        return AdviceResponse(
            answer=data.get("answer", "Xin lỗi, tôi không thể trả lời lúc này."),
            is_spending_related=data.get("is_spending_related", False),
            suggested_proposal_name=data.get("suggested_proposal_name"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

"""Verdict card image generation via GPT Image 1 (OpenAI).

The generated image is a creative neobrutalist illustration that serves
as the background for the shareable verdict card — the frontend overlays
the actual text data on top before the user downloads/shares.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..config import IMAGE_API_KEY, IMAGE_BASE_URL, IMAGE_MODEL
from ..models import VerdictCardRequest, VerdictCardResponse

router = APIRouter(prefix="/api/verdict-card", tags=["cards"])

_MOOD_PROMPTS = {
    "approve": (
        "Vibrant celebration scene for a Vietnamese financial board of directors app. "
        "Neobrutalist flat illustration: confetti raining down, corporate board members cheering, "
        "champagne glasses, golden coins, bold black outlines, yellow and emerald green color palette. "
        "Joyful energetic atmosphere. No text, no letters, pure illustration."
    ),
    "approve_with_conditions": (
        "Cautiously optimistic scene for a Vietnamese financial board of directors app. "
        "Neobrutalist flat illustration: board members giving thumbs-up with raised eyebrows, "
        "checkmarks with asterisks, amber and yellow color palette, bold black outlines. "
        "Thoughtful yet positive mood. No text, no letters, pure illustration."
    ),
    "delay": (
        "Contemplative board meeting scene for a Vietnamese financial app. "
        "Neobrutalist flat illustration: board members stroking chins, hourglass, calendar, "
        "amber and orange color palette, bold black outlines. "
        "Pensive waiting atmosphere. No text, no letters, pure illustration."
    ),
    "reject": (
        "Dramatic rejection scene for a Vietnamese financial board of directors app. "
        "Neobrutalist flat illustration: stern board members, large red X stamp, gavel slamming, "
        "rose red and dark color palette, bold black outlines. "
        "Serious dramatic atmosphere. No text, no letters, pure illustration."
    ),
}


@router.post("", response_model=VerdictCardResponse)
async def generate_verdict_card(req: VerdictCardRequest) -> VerdictCardResponse:
    if not IMAGE_API_KEY or not IMAGE_BASE_URL:
        raise HTTPException(status_code=503, detail="Image generation not configured (missing IMAGE_API_KEY or IMAGE_BASE_URL)")

    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=IMAGE_API_KEY, base_url=IMAGE_BASE_URL)
    mood = req.decision if req.decision in _MOOD_PROMPTS else "reject"
    prompt = _MOOD_PROMPTS[mood]

    try:
        response = await client.images.generate(
            model=IMAGE_MODEL,
            prompt=prompt,
            n=1,
            size="1024x1024",
            response_format="b64_json",
        )
        b64 = response.data[0].b64_json or ""
        return VerdictCardResponse(image_b64=b64)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {e}")

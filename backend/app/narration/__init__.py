"""Narration provider selection — the one place that decides which AI (if
any) narrates the board meeting. Swapping models means writing a new
NarrationProvider and changing the branch below; nothing else in the app
needs to know."""
from __future__ import annotations

from functools import lru_cache

from ..config import LLM_PROVIDER
from .base import NarrationProvider
from .fallback_provider import FallbackProvider

__all__ = ["NarrationProvider", "FallbackProvider", "get_provider"]


@lru_cache(maxsize=1)
def get_provider() -> NarrationProvider:
    if LLM_PROVIDER == "fallback":
        return FallbackProvider()
    if LLM_PROVIDER == "openai":
        try:
            from .openai_provider import OpenAIProvider
            return OpenAIProvider()
        except Exception:
            return FallbackProvider()
    try:
        from .gemini_provider import GeminiProvider
        return GeminiProvider()
    except Exception:
        return FallbackProvider()

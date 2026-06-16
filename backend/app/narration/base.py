"""Abstract contract for the AI narration plug-in.

The engine (engine/scoring.py) never imports anything from this package.
Narration providers consume an already-finished EvaluationResult and turn it
into a board "roast" — they are not allowed to change any number or decision,
only to describe it. This is what makes the AI layer optional: the app keeps
working (FallbackProvider) if no provider is configured or the call fails.
"""
from __future__ import annotations

from abc import ABC, abstractmethod

from ..models import EvaluationResult, NarrationResult, ProposalInput


class NarrationProvider(ABC):
    @abstractmethod
    async def generate_board_narration(self, evaluation: EvaluationResult, proposal: ProposalInput, display_name: str) -> NarrationResult:
        ...

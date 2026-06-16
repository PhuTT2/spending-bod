"""Resolving the user's obey/defy choice after a board verdict.

This is pure business logic — not AI, not presentation — so it belongs in
the engine, not in a React event handler. Previously this math lived in
App.tsx (handleUserDecision) and disagreed with the unused disciplineImpact
decisionCore.ts had already computed. Now there is one implementation.
"""
from __future__ import annotations

from ..models import EvaluationResult, UserAction


def resolve_user_decision(
    evaluation: EvaluationResult, user_action: UserAction, current_score: int, current_cash_balance: float, amount: float
) -> tuple[int, int, float, bool]:
    """Returns (score_change, new_score, new_cash_balance, money_was_spent)."""
    board_approved = evaluation.decision in ("approve", "approve_with_conditions")

    if user_action == "obeyed":
        score_change = evaluation.obey_reward
        spent = board_approved
    else:
        score_change = evaluation.defy_penalty
        spent = not board_approved

    new_score = max(0, min(100, current_score + score_change))
    new_cash_balance = max(0.0, current_cash_balance - amount) if spent else current_cash_balance
    return score_change, new_score, new_cash_balance, spent

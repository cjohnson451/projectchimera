from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from .db import get_db
from .auth import get_current_user
from .delta_models import DBDeltaCard, DBMemoDelta

router = APIRouter(prefix="/api/delta", tags=["delta"])


@router.get("/{ticker}/cards")
def get_delta_cards(ticker: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    cards = (
        db.query(DBDeltaCard)
        .filter(DBDeltaCard.ticker == ticker.upper())
        .order_by(DBDeltaCard.detected_at.desc())
        .limit(50)
        .all()
    )
    def serialize(card: DBDeltaCard):
        return {
            "id": str(card.id),
            "ticker": card.ticker,
            "category": card.category,
            "summary": card.summary,
            "why_it_matters": card.why_it_matters,
            "metric": card.metric,
            "old_value": card.old_value,
            "new_value": card.new_value,
            "change": card.change,
            "evidence": [],  # evidence endpoint can be added later; keep API stable
            "detected_at": card.detected_at.isoformat() if card.detected_at else None,
        }
    return [serialize(c) for c in cards]


@router.post("/{ticker}/memo")
def generate_memo_delta(ticker: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Minimal placeholder: create a memo shell that references existing cards
    cards = (
        db.query(DBDeltaCard)
        .filter(DBDeltaCard.ticker == ticker.upper())
        .order_by(DBDeltaCard.detected_at.desc())
        .limit(10)
        .all()
    )
    deltas = [
        {
            "id": str(c.id),
            "ticker": c.ticker,
            "category": c.category,
            "summary": c.summary,
            "why_it_matters": c.why_it_matters,
            "metric": c.metric,
            "old_value": c.old_value,
            "new_value": c.new_value,
            "change": c.change,
            "evidence": [],
            "detected_at": c.detected_at.isoformat() if c.detected_at else None,
        }
        for c in cards
    ]

    memo = DBMemoDelta(
        ticker=ticker.upper(),
        as_of=date.today(),
        recommendation="hold",
        position_size_pct=0.0,
        confidence_pct=50.0,
        bull_points=[],
        bear_points=[],
        risks=[],
        deltas=deltas,
        catalysts=[],
    )
    db.add(memo)
    db.commit()
    db.refresh(memo)

    return {
        "id": str(memo.id),
        "ticker": memo.ticker,
        "as_of": memo.as_of.isoformat(),
        "recommendation": memo.recommendation,
        "position_size_pct": memo.position_size_pct,
        "confidence_pct": memo.confidence_pct,
        "bull_points": memo.bull_points,
        "bear_points": memo.bear_points,
        "risks": memo.risks,
        "deltas": memo.deltas,
        "catalysts": memo.catalysts,
    }



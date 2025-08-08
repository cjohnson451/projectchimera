#!/usr/bin/env python3
import json
from datetime import datetime

from app.db import SessionLocal
from app.delta_models import DBDeltaCard, DBSourceLog
from apps.ingest.worker import emit_sample_cards, EDGAR_SAMPLE_URL


def seed_delta_cards(ticker: str = "GOOG") -> int:
    session = SessionLocal()
    count = 0

    cards = emit_sample_cards(ticker)
    # Log source
    source_log = DBSourceLog(
        url=EDGAR_SAMPLE_URL,
        source_type="edgar",
        fetched_at=datetime.utcnow(),
        content_hash="seed",
    )
    session.add(source_log)
    session.flush()

    for c in cards:
        dc = DBDeltaCard(
            ticker=c["ticker"],
            category=c["category"],
            summary=c["summary"],
            why_it_matters=c["why_it_matters"],
            metric=c.get("metric"),
            old_value=c.get("old_value"),
            new_value=c.get("new_value"),
            change=c.get("change"),
            detected_at=datetime.fromisoformat(c["detected_at"]),
        )
        session.add(dc)
        count += 1
    session.commit()
    session.close()
    return count


if __name__ == "__main__":
    inserted = seed_delta_cards()
    print(f"Seeded {inserted} DeltaCards for GOOG")



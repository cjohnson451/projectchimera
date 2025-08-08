import hashlib
import json
from datetime import datetime
from typing import List

import requests

# Placeholder ingestion worker: logs a SourceLog and creates a trivial DeltaCard
# Real implementation would fetch EDGAR filings, sectionize, redline, compute technicals, etc.

EDGAR_SAMPLE_URL = "https://www.sec.gov/Archives/edgar/data/1652044/000165204424000114/goog-20240630.htm"


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def fetch_text(url: str) -> str:
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    return resp.text


def emit_sample_cards(ticker: str = "GOOG") -> List[dict]:
    html = fetch_text(EDGAR_SAMPLE_URL)
    content_hash = sha256_text(html)

    evidence = [
        {
            "evidence_url": EDGAR_SAMPLE_URL,
            "quote": "Sample evidence quote from filing...",
            "timestamp": datetime.utcnow().isoformat(),
            "source_type": "edgar",
        }
    ]

    cards = [
        {
            "id": "seed-1",
            "ticker": ticker,
            "category": "filing",
            "summary": "Sample change detected between filings.",
            "why_it_matters": "Indicates shift in management guidance language.",
            "metric": None,
            "old_value": None,
            "new_value": None,
            "change": None,
            "evidence": evidence,
            "detected_at": datetime.utcnow().isoformat(),
        },
        {
            "id": "seed-2",
            "ticker": ticker,
            "category": "price",
            "summary": "50DMA crossed below 200DMA.",
            "why_it_matters": "Potential bearish long-term signal.",
            "metric": "MA crossover",
            "old_value": "Golden",
            "new_value": "Death",
            "change": "Crossed",
            "evidence": evidence,
            "detected_at": datetime.utcnow().isoformat(),
        },
        {
            "id": "seed-3",
            "ticker": ticker,
            "category": "news",
            "summary": "Major product update announced.",
            "why_it_matters": "May impact revenue trajectory.",
            "metric": None,
            "old_value": None,
            "new_value": None,
            "change": None,
            "evidence": evidence,
            "detected_at": datetime.utcnow().isoformat(),
        },
    ]

    return cards


if __name__ == "__main__":
    print(json.dumps(emit_sample_cards(), indent=2))



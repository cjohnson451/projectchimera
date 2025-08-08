from __future__ import annotations
from typing import List, Literal, Optional
from pydantic import BaseModel, HttpUrl, Field
from datetime import datetime, date


class EvidenceItem(BaseModel):
    evidence_url: HttpUrl
    quote: str
    timestamp: datetime
    source_type: Literal["edgar", "news", "price", "other"]


class DeltaCard(BaseModel):
    id: str
    ticker: str
    category: Literal["filing", "guidance", "insider", "price", "news"]
    summary: str
    why_it_matters: str
    metric: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    change: Optional[str] = None
    evidence: List[EvidenceItem] = Field(default_factory=list)
    detected_at: datetime


class Catalyst(BaseModel):
    id: str
    ticker: str
    title: str
    date: date
    expected_direction: Literal["up", "down", "unclear"]
    confidence: Literal["low", "medium", "high"]
    postmortem: Optional[str] = None


class MemoDelta(BaseModel):
    id: str
    ticker: str
    as_of: date
    recommendation: Literal["buy", "hold", "sell"]
    position_size_pct: float
    confidence_pct: float
    bull_points: List[str]
    bear_points: List[str]
    risks: List[str]
    deltas: List[DeltaCard]
    catalysts: List[Catalyst]


class SourceLog(BaseModel):
    id: str
    url: HttpUrl
    source_type: Literal["edgar", "news", "price", "other"]
    fetched_at: datetime
    content_hash: str



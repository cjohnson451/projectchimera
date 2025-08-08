from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Date, Boolean, Text, ForeignKey, JSON, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .db import Base


class DBFiling(Base):
    __tablename__ = "filings"
    id = Column(Integer, primary_key=True)
    ticker = Column(String, index=True)
    filing_type = Column(String)  # 10-K, 10-Q, 8-K
    filed_at = Column(DateTime, index=True)
    url = Column(String)


class DBFilingVersion(Base):
    __tablename__ = "filing_versions"
    id = Column(Integer, primary_key=True)
    filing_id = Column(Integer, ForeignKey("filings.id"))
    section = Column(String)  # MD&A, Risk Factors, Guidance/KPIs
    content_hash = Column(String, index=True)
    content_text = Column(Text)
    created_at = Column(DateTime, default=func.now())


class DBSourceLog(Base):
    __tablename__ = "source_logs"
    id = Column(Integer, primary_key=True)
    url = Column(String, index=True)
    source_type = Column(String)
    fetched_at = Column(DateTime, index=True, default=func.now())
    content_hash = Column(String, index=True)

    __table_args__ = (
        Index("ix_source_url_hash", "url", "content_hash"),
    )


class DBDeltaCard(Base):
    __tablename__ = "delta_cards"
    id = Column(Integer, primary_key=True)
    ticker = Column(String, index=True)
    category = Column(String)
    summary = Column(Text)
    why_it_matters = Column(Text)
    metric = Column(String, nullable=True)
    old_value = Column(String, nullable=True)
    new_value = Column(String, nullable=True)
    change = Column(String, nullable=True)
    detected_at = Column(DateTime, index=True, default=func.now())

    __table_args__ = (
        Index("ix_delta_ticker_detected", "ticker", "detected_at"),
    )


class DBEvidence(Base):
    __tablename__ = "evidence"
    id = Column(Integer, primary_key=True)
    delta_card_id = Column(Integer, ForeignKey("delta_cards.id"))
    evidence_url = Column(String)
    quote = Column(Text)
    timestamp = Column(DateTime, default=func.now())
    source_type = Column(String)


class DBCatalyst(Base):
    __tablename__ = "catalysts"
    id = Column(Integer, primary_key=True)
    ticker = Column(String, index=True)
    title = Column(String)
    date = Column(Date)
    expected_direction = Column(String)
    confidence = Column(String)
    postmortem = Column(Text, nullable=True)


class DBMemoDelta(Base):
    __tablename__ = "memos_delta"
    id = Column(Integer, primary_key=True)
    ticker = Column(String, index=True)
    as_of = Column(Date)
    recommendation = Column(String)
    position_size_pct = Column(Float)
    confidence_pct = Column(Float)
    bull_points = Column(JSON)
    bear_points = Column(JSON)
    risks = Column(JSON)
    deltas = Column(JSON)  # store array of DeltaCard JSON for auditability
    catalysts = Column(JSON)


class DBRun(Base):
    __tablename__ = "runs"
    id = Column(Integer, primary_key=True)
    started_at = Column(DateTime, default=func.now())
    finished_at = Column(DateTime, nullable=True)
    status = Column(String, default="pending")
    details = Column(JSON, nullable=True)



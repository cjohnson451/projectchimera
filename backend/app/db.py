from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Date, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from datetime import datetime, date
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL - for MVP, we'll use SQLite for simplicity, but this can be changed to PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./chimera.db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Database Models
class DBUser(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    fund_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

    watchlists = relationship("DBWatchlist", back_populates="user")
    memos = relationship("DBMemo", back_populates="user")

class DBWatchlist(Base):
    __tablename__ = "watchlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    ticker = Column(String)
    added_at = Column(DateTime, default=func.now())

    user = relationship("DBUser", back_populates="watchlists")

class DBPriceBar(Base):
    __tablename__ = "price_bars"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, index=True)
    date = Column(Date)
    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    close = Column(Float)
    volume = Column(Integer)

class DBFundamental(Base):
    __tablename__ = "fundamentals"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, index=True)
    date = Column(Date)
    revenue = Column(Float, nullable=True)
    net_income = Column(Float, nullable=True)
    eps = Column(Float, nullable=True)
    pe_ratio = Column(Float, nullable=True)
    market_cap = Column(Float, nullable=True)

class DBNewsItem(Base):
    __tablename__ = "news_items"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, index=True)
    date = Column(DateTime)
    headline = Column(String)
    summary = Column(Text)
    url = Column(String)
    sentiment_score = Column(Float, nullable=True)

class DBMemo(Base):
    __tablename__ = "memos"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, index=True)
    date = Column(Date)
    user_id = Column(Integer, ForeignKey("users.id"))
    fundamental_analysis = Column(Text)
    technical_analysis = Column(Text)
    sentiment_analysis = Column(Text)
    chief_strategist_analysis = Column(Text)
    risk_assessment = Column(Text)
    recommendation = Column(String)
    position_size = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    status = Column(String, default="pending")
    pm_decision = Column(String, nullable=True)
    pm_decision_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now())

    user = relationship("DBUser", back_populates="memos")

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)

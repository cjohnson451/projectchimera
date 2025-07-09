from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Date, Boolean, Text, ForeignKey, JSON
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
    usage = relationship("DBUserUsage", back_populates="user")
    usage_limit = relationship("DBUsageLimit", back_populates="user", uselist=False)

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
    
    # Enhanced fields for new features
    research_debate = Column(JSON, nullable=True)  # Store research debate results as JSON
    advanced_risk_assessment = Column(JSON, nullable=True)  # Store advanced risk assessment as JSON
    risk_score = Column(Float, nullable=True)  # Numeric risk score (1-10)
    risk_category = Column(String, nullable=True)  # "Low Risk", "Medium Risk", "High Risk"
    
    # Standard memo structure fields
    market_opportunity = Column(Text, nullable=True)
    business_overview = Column(Text, nullable=True)
    competitive_analysis = Column(Text, nullable=True)
    management_team = Column(Text, nullable=True)
    investment_thesis = Column(Text, nullable=True)
    risks_and_mitigation = Column(Text, nullable=True)
    valuation_and_deal_structure = Column(Text, nullable=True)
    source_citations = Column(Text, nullable=True)  # Store as JSON string
    
    # Memory tracking fields
    memory_situation_id = Column(String, nullable=True)  # ID from memory system
    memory_decision_id = Column(String, nullable=True)  # ID from memory system

    user = relationship("DBUser", back_populates="memos")

class DBUserUsage(Base):
    __tablename__ = "user_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    api_calls = Column(Integer, default=0)  # Number of API calls made
    estimated_cost = Column(Float, default=0.0)  # Estimated cost in USD
    memo_count = Column(Integer, default=0)  # Number of memos generated
    created_at = Column(DateTime, default=func.now())
    
    # Relationship
    user = relationship("DBUser", back_populates="usage")

class DBUsageLimit(Base):
    __tablename__ = "usage_limits"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    daily_memo_limit = Column(Integer, default=10)
    daily_cost_limit = Column(Float, default=5.0)  # USD
    monthly_cost_limit = Column(Float, default=50.0)  # USD
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relationship
    user = relationship("DBUser", back_populates="usage_limit")

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

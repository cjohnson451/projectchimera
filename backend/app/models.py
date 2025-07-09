from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional, List
from enum import Enum

# Enums
class RecommendationType(str, Enum):
    BUY = "Buy"
    SELL = "Sell"
    HOLD = "Hold"

class MemoStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

# Database Models
class User(BaseModel):
    id: Optional[int] = None
    email: EmailStr
    hashed_password: str
    fund_name: str
    is_active: bool = True
    created_at: datetime = datetime.now()

class Watchlist(BaseModel):
    id: Optional[int] = None
    user_id: int
    ticker: str
    added_at: datetime = datetime.now()

class PriceBar(BaseModel):
    id: Optional[int] = None
    ticker: str
    date: date
    open: float
    high: float
    low: float
    close: float
    volume: int

class Fundamental(BaseModel):
    id: Optional[int] = None
    ticker: str
    date: date
    revenue: Optional[float] = None
    net_income: Optional[float] = None
    eps: Optional[float] = None
    pe_ratio: Optional[float] = None
    market_cap: Optional[float] = None

class NewsItem(BaseModel):
    id: Optional[int] = None
    ticker: str
    date: datetime
    headline: str
    summary: str
    url: str
    sentiment_score: Optional[float] = None

class Memo(BaseModel):
    id: Optional[int] = None
    ticker: str
    date: date
    user_id: int
    fundamental_analysis: str
    technical_analysis: str
    sentiment_analysis: str
    chief_strategist_analysis: str
    risk_assessment: str
    recommendation: RecommendationType
    position_size: Optional[float] = None
    confidence_score: Optional[float] = None
    status: MemoStatus = MemoStatus.PENDING
    pm_decision: Optional[str] = None
    pm_decision_at: Optional[datetime] = None
    created_at: datetime = datetime.now()

# API Request/Response Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    fund_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class WatchlistCreate(BaseModel):
    ticker: str

class MemoResponse(BaseModel):
    id: int
    ticker: str
    date: date
    fundamental_analysis: str
    technical_analysis: str
    sentiment_analysis: str
    chief_strategist_analysis: str
    risk_assessment: str
    recommendation: RecommendationType
    position_size: Optional[float] = None
    confidence_score: Optional[float] = None
    status: MemoStatus
    created_at: datetime

class MemoDecision(BaseModel):
    decision: str  # "approve" or "reject"
    notes: Optional[str] = None

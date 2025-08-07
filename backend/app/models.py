from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional, List, Dict, Any
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
    COMPLETE = "complete"

class RiskCategory(str, Enum):
    LOW_RISK = "Low Risk"
    MEDIUM_RISK = "Medium Risk"
    HIGH_RISK = "High Risk"

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

# Enhanced models for new features
class ResearchDebate(BaseModel):
    """Model for research team debate results."""
    bull_analysis: str
    bear_analysis: str
    debate_synthesis: str
    key_points: Dict[str, List[str]]
    debate_history: Optional[List[str]] = None

class RiskMetrics(BaseModel):
    """Model for advanced risk metrics."""
    position_size_recommendations: Dict[str, Optional[float]]
    confidence_levels: Dict[str, Optional[float]]
    risk_score: float
    risk_category: RiskCategory
    key_risk_factors: List[str]

class AdvancedRiskAssessment(BaseModel):
    """Model for advanced risk assessment results."""
    conservative_analysis: str
    aggressive_analysis: str
    neutral_analysis: str
    risk_synthesis: str
    risk_metrics: RiskMetrics
    debate_history: Optional[List[str]] = None
    final_recommendation: Dict[str, Any]

class MemoryTracking(BaseModel):
    """Model for memory system tracking."""
    memory_situation_id: Optional[str] = None
    memory_decision_id: Optional[str] = None
    memory_error: Optional[str] = None

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
    
    # Enhanced fields for new features
    research_debate: Optional[Dict[str, Any]] = None
    advanced_risk_assessment: Optional[Dict[str, Any]] = None
    risk_score: Optional[float] = None
    risk_category: Optional[RiskCategory] = None
    
    # Standard memo structure fields
    market_opportunity: Optional[str] = None
    business_overview: Optional[str] = None
    competitive_analysis: Optional[str] = None
    management_team: Optional[str] = None
    investment_thesis: Optional[str] = None
    risks_and_mitigation: Optional[str] = None
    valuation_and_deal_structure: Optional[str] = None
    source_citations: Optional[str] = None  # JSON string for database storage
    
    # Memory tracking
    memory_situation_id: Optional[str] = None
    memory_decision_id: Optional[str] = None

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
    
    # Enhanced fields
    research_debate: Optional[Dict[str, Any]] = None
    advanced_risk_assessment: Optional[Dict[str, Any]] = None
    risk_score: Optional[float] = None
    risk_category: Optional[RiskCategory] = None
    
    # Standard memo structure
    market_opportunity: Optional[str] = None
    business_overview: Optional[str] = None
    competitive_analysis: Optional[str] = None
    management_team: Optional[str] = None
    investment_thesis: Optional[str] = None
    risks_and_mitigation: Optional[str] = None
    valuation_and_deal_structure: Optional[str] = None
    source_citations: Optional[list] = None
    
    # Memory tracking
    memory_situation_id: Optional[str] = None
    memory_decision_id: Optional[str] = None

class MemoDecision(BaseModel):
    decision: str  # "approve" or "reject"
    notes: Optional[str] = None

# New models for enhanced features
class MemoryInsights(BaseModel):
    """Model for memory system insights."""
    performance_insights: Dict[str, Any]
    lessons_learned: List[str]
    memory_enabled: bool
    error: Optional[str] = None

class EnhancedMemoRequest(BaseModel):
    """Model for enhanced memo generation requests."""
    ticker: Optional[str] = None  # Optional since it's in the URL path
    enable_memory: bool = True
    enable_research_debate: bool = True
    enable_risk_debate: bool = True

class MemoOutcomeUpdate(BaseModel):
    """Model for updating memo outcomes."""
    memo_id: str
    outcome: str
    performance_score: Optional[float] = None

# Configuration models
class AgentConfiguration(BaseModel):
    """Model for agent system configuration."""
    enable_memory: bool = True
    enable_research_debate: bool = True
    enable_risk_debate: bool = True
    debate_rounds: int = 2
    memory_retention_days: int = 730

class PerformanceMetrics(BaseModel):
    """Model for performance tracking."""
    total_decisions: int
    avg_performance: float
    best_decision_type: Optional[str] = None
    worst_decision_type: Optional[str] = None
    decision_breakdown: Dict[str, Dict[str, Any]]

class UserUsage(BaseModel):
    """Model for tracking user API usage and costs."""
    id: Optional[int] = None
    user_id: int
    date: date
    api_calls: int = 0
    estimated_cost: float = 0.0
    memo_count: int = 0
    created_at: datetime = datetime.now()

class UsageLimit(BaseModel):
    """Model for user usage limits."""
    user_id: int
    daily_memo_limit: int = 10
    daily_cost_limit: float = 5.0  # USD
    monthly_cost_limit: float = 50.0  # USD
    is_active: bool = True

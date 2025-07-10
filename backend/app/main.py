from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List, Optional
import os
import json
from dotenv import load_dotenv

from app.db import get_db, create_tables, DBUser, DBWatchlist, DBMemo, SessionLocal
from app.models import (
    UserCreate, UserLogin, Token, WatchlistCreate, MemoResponse, MemoDecision,
    RecommendationType, MemoStatus, MemoryInsights, EnhancedMemoRequest, 
    MemoOutcomeUpdate, AgentConfiguration
)
from app.agents.orchestrator import AgentOrchestrator
from app.agents.enhanced_orchestrator import EnhancedAgentOrchestrator
from app.services.market_data import MarketDataService
from app.services.usage_tracker import usage_tracker
from app.auth import create_access_token, get_current_user, get_password_hash, verify_password

load_dotenv()

# Create tables on startup
create_tables()

app = FastAPI(
    title="Project Chimera API",
    description="Multi-agent AI investment analysis platform with enhanced features",
    version="2.0.0"
)

@app.on_event("startup")
async def startup_event():
    """Clean up any stuck pending memos and fix invalid recommendations on startup."""
    try:
        db = SessionLocal()
        
        # Fix pending memos
        pending_memos = db.query(DBMemo).filter(DBMemo.status == "pending").all()
        for memo in pending_memos:
            memo.status = "complete"
            if not memo.fundamental_analysis or memo.fundamental_analysis == "":
                memo.fundamental_analysis = "Memo generation was interrupted during server restart"
        
        # Fix invalid recommendations
        invalid_memos = db.query(DBMemo).filter(
            ~DBMemo.recommendation.in_(["Buy", "Sell", "Hold"])
        ).all()
        for memo in invalid_memos:
            old_rec = memo.recommendation
            memo.recommendation = "Hold"
            print(f"Fixed invalid recommendation '{old_rec}' for memo {memo.id} to 'Hold'")
        
        # Ensure all memos have complete status
        incomplete_memos = db.query(DBMemo).filter(
            DBMemo.status.in_(["pending", "error"])
        ).all()
        for memo in incomplete_memos:
            memo.status = "complete"
        
        db.commit()
        db.close()
        print(f"Cleaned up {len(pending_memos)} stuck pending memos on startup")
        print(f"Fixed {len(invalid_memos)} invalid recommendations on startup")
        print(f"Fixed {len(incomplete_memos)} incomplete memos on startup")
    except Exception as e:
        print(f"Error cleaning up memos on startup: {e}")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        # Add your production frontend URL below:
        "https://projectchimera-frontend.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Initialize services
orchestrator = AgentOrchestrator()
enhanced_orchestrator = EnhancedAgentOrchestrator()
market_data_service = MarketDataService()

@app.get("/")
async def root():
    return {"message": "Project Chimera API - Enhanced Multi-agent AI Investment Analysis"}

@app.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    existing_user = db.query(DBUser).filter(DBUser.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = DBUser(
        email=user_data.email,
        hashed_password=hashed_password,
        fund_name=user_data.fund_name
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_data.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login user."""
    user = db.query(DBUser).filter(DBUser.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": user_data.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me")
async def get_current_user_info(current_user: DBUser = Depends(get_current_user)):
    """Get current user information."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "fund_name": current_user.fund_name
    }

@app.post("/auth/delete-account")
async def delete_account(current_user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete the current user and all their data."""
    # Delete memos
    db.query(DBMemo).filter(DBMemo.user_id == current_user.id).delete()
    # Delete watchlist
    db.query(DBWatchlist).filter(DBWatchlist.user_id == current_user.id).delete()
    # Delete user
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted successfully"}

@app.get("/watchlist", response_model=List[str])
async def get_watchlist(
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's watchlist."""
    watchlist = db.query(DBWatchlist).filter(DBWatchlist.user_id == current_user.id).all()
    return [item.ticker for item in watchlist]

@app.post("/watchlist")
async def add_to_watchlist(
    ticker_data: WatchlistCreate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add ticker to watchlist."""
    # Check if already in watchlist
    existing = db.query(DBWatchlist).filter(
        DBWatchlist.user_id == current_user.id,
        DBWatchlist.ticker == ticker_data.ticker.upper()
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticker already in watchlist"
        )
    
    # Check watchlist size limit (20 for MVP)
    watchlist_count = db.query(DBWatchlist).filter(DBWatchlist.user_id == current_user.id).count()
    if watchlist_count >= 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Watchlist limit reached (20 tickers)"
        )
    
    # Add to watchlist
    watchlist_item = DBWatchlist(
        user_id=current_user.id,
        ticker=ticker_data.ticker.upper()
    )
    
    db.add(watchlist_item)
    db.commit()
    
    return {"message": f"Added {ticker_data.ticker.upper()} to watchlist"}

@app.delete("/watchlist/{ticker}")
async def remove_from_watchlist(
    ticker: str,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove ticker from watchlist."""
    watchlist_item = db.query(DBWatchlist).filter(
        DBWatchlist.user_id == current_user.id,
        DBWatchlist.ticker == ticker.upper()
    ).first()
    
    if not watchlist_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticker not found in watchlist"
        )
    
    db.delete(watchlist_item)
    db.commit()
    
    return {"message": f"Removed {ticker.upper()} from watchlist"}

@app.get("/memos", response_model=List[MemoResponse])
async def get_memos(
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db),
    ticker: Optional[str] = None,
    status: Optional[str] = None,
    recommendation: Optional[str] = None
):
    """Get all memos for the current user, optionally filtered by ticker, status, or recommendation. Only show memos with status 'complete' by default."""
    query = db.query(DBMemo).filter(DBMemo.user_id == current_user.id)
    if ticker:
        query = query.filter(DBMemo.ticker == ticker.upper())
    # Only show complete memos by default
    if status:
        query = query.filter(DBMemo.status == status)
    else:
        query = query.filter(DBMemo.status == "complete")
    if recommendation:
        query = query.filter(DBMemo.recommendation == recommendation)
    memos = query.order_by(DBMemo.created_at.desc()).all()
    # Convert to response models
    memo_responses = []
    for memo in memos:
        source_citations = []
        if memo.source_citations:
            try:
                source_citations = json.loads(memo.source_citations)
            except:
                source_citations = []
        memo_response = MemoResponse(
            id=memo.id,
            ticker=memo.ticker,
            date=memo.date,
            fundamental_analysis=memo.fundamental_analysis,
            technical_analysis=memo.technical_analysis,
            sentiment_analysis=memo.sentiment_analysis,
            chief_strategist_analysis=memo.chief_strategist_analysis,
            risk_assessment=memo.risk_assessment,
            recommendation=memo.recommendation,
            position_size=memo.position_size,
            confidence_score=memo.confidence_score,
            status=memo.status,
            created_at=memo.created_at,
            # Enhanced fields
            research_debate=memo.research_debate,
            advanced_risk_assessment=memo.advanced_risk_assessment,
            risk_score=memo.risk_score,
            risk_category=memo.risk_category,
            # Standard memo fields
            market_opportunity=memo.market_opportunity,
            business_overview=memo.business_overview,
            competitive_analysis=memo.competitive_analysis,
            management_team=memo.management_team,
            investment_thesis=memo.investment_thesis,
            risks_and_mitigation=memo.risks_and_mitigation,
            valuation_and_deal_structure=memo.valuation_and_deal_structure,
            source_citations=source_citations,
            # Memory tracking
            memory_situation_id=memo.memory_situation_id,
            memory_decision_id=memo.memory_decision_id
        )
        memo_responses.append(memo_response)
    return memo_responses

@app.get("/memos/{memo_id}", response_model=MemoResponse)
async def get_memo(
    memo_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific memo by ID."""
    memo = db.query(DBMemo).filter(
        DBMemo.id == memo_id,
        DBMemo.user_id == current_user.id
    ).first()
    
    if not memo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memo not found"
        )
    
    # Parse source citations
    source_citations = []
    if memo.source_citations:
        try:
            source_citations = json.loads(memo.source_citations)
        except:
            source_citations = []
    
    return MemoResponse(
        id=memo.id,
        ticker=memo.ticker,
        date=memo.date,
        fundamental_analysis=memo.fundamental_analysis,
        technical_analysis=memo.technical_analysis,
        sentiment_analysis=memo.sentiment_analysis,
        chief_strategist_analysis=memo.chief_strategist_analysis,
        risk_assessment=memo.risk_assessment,
        recommendation=memo.recommendation,
        position_size=memo.position_size,
        confidence_score=memo.confidence_score,
        status=memo.status,
        created_at=memo.created_at,
        
        # Enhanced fields
        research_debate=memo.research_debate,
        advanced_risk_assessment=memo.advanced_risk_assessment,
        risk_score=memo.risk_score,
        risk_category=memo.risk_category,
        
        # Standard memo fields
        market_opportunity=memo.market_opportunity,
        business_overview=memo.business_overview,
        competitive_analysis=memo.competitive_analysis,
        management_team=memo.management_team,
        investment_thesis=memo.investment_thesis,
        risks_and_mitigation=memo.risks_and_mitigation,
        valuation_and_deal_structure=memo.valuation_and_deal_structure,
        source_citations=source_citations,
        
        # Memory tracking
        memory_situation_id=memo.memory_situation_id,
        memory_decision_id=memo.memory_decision_id
    )

@app.post("/memos/generate/{ticker}")
async def generate_memo(
    ticker: str,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a memo for a specific ticker using the basic orchestrator."""
    try:
        # Set status to pending at creation
        db_memo = DBMemo(
            ticker=ticker.upper(),
            date=date.today(),
            user_id=current_user.id,
            fundamental_analysis="",
            technical_analysis="",
            sentiment_analysis="",
            chief_strategist_analysis="",
            risk_assessment="",
            recommendation="Hold",
            position_size=None,
            confidence_score=None,
            market_opportunity=None,
            business_overview=None,
            competitive_analysis=None,
            management_team=None,
            investment_thesis=None,
            risks_and_mitigation=None,
            valuation_and_deal_structure=None,
            source_citations=None,
            status="pending"
        )
        db.add(db_memo)
        db.commit()
        db.refresh(db_memo)
        # Get market data
        fundamental_data = market_data_service.get_fundamental_data(ticker)
        technical_data = market_data_service.get_technical_data(ticker)
        sentiment_data = market_data_service.get_sentiment_data(ticker)
        # Generate memo using basic orchestrator
        memo_data = orchestrator.generate_memo(ticker, fundamental_data, technical_data, sentiment_data)
        # Update db_memo with all fields from memo_data
        db_memo.fundamental_analysis = memo_data.get('financial_analysis', "") or ""
        db_memo.technical_analysis = memo_data.get('technical_analysis', "") or ""
        db_memo.sentiment_analysis = memo_data.get('sentiment_analysis', "") or ""
        db_memo.chief_strategist_analysis = memo_data.get('investment_thesis', "") or ""
        db_memo.risk_assessment = memo_data.get('risks_and_mitigation', "") or ""
        # Ensure recommendation is valid
        recommendation = memo_data.get('recommendation', "Hold") or "Hold"
        valid_recommendations = ["Buy", "Sell", "Hold"]
        if recommendation not in valid_recommendations:
            print(f"Invalid recommendation from orchestrator: '{recommendation}', defaulting to 'Hold'")
            recommendation = "Hold"
        db_memo.recommendation = recommendation
        db_memo.position_size = memo_data.get('position_size')
        db_memo.confidence_score = memo_data.get('confidence_score')
        db_memo.market_opportunity = memo_data.get('market_opportunity', "") or ""
        db_memo.business_overview = memo_data.get('business_overview', "") or ""
        db_memo.competitive_analysis = memo_data.get('competitive_analysis', "") or ""
        db_memo.management_team = memo_data.get('management_team', "") or ""
        db_memo.investment_thesis = memo_data.get('investment_thesis', "") or ""
        db_memo.risks_and_mitigation = memo_data.get('risks_and_mitigation', "") or ""
        db_memo.valuation_and_deal_structure = memo_data.get('valuation_and_deal_structure', "") or ""
        db_memo.source_citations = json.dumps(memo_data.get('source_citations', []) or [])
        db_memo.status = memo_data.get('status', 'complete') or 'complete'
        db.commit()
        db.refresh(db_memo)
        return {"message": f"Memo generated for {ticker.upper()}", "memo_id": db_memo.id}
    except Exception as e:
        db_memo.status = "error"
        db_memo.fundamental_analysis = f"Memo generation failed: {str(e)}"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating memo: {str(e)}"
        )

@app.post("/memos/generate-enhanced/{ticker}")
async def generate_enhanced_memo(
    ticker: str,
    request: EnhancedMemoRequest,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate an enhanced memo with advanced features."""
    try:
        # Set status to pending at creation
        db_memo = DBMemo(
            ticker=ticker.upper(),
            date=date.today(),
            user_id=current_user.id,
            fundamental_analysis="",
            technical_analysis="",
            sentiment_analysis="",
            chief_strategist_analysis="",
            risk_assessment="",
            recommendation="Hold",
            position_size=None,
            confidence_score=None,
            market_opportunity=None,
            business_overview=None,
            competitive_analysis=None,
            management_team=None,
            investment_thesis=None,
            risks_and_mitigation=None,
            valuation_and_deal_structure=None,
            source_citations=None,
            status="pending"
        )
        db.add(db_memo)
        db.commit()
        db.refresh(db_memo)
        # Get market data
        fundamental_data = market_data_service.get_fundamental_data(ticker)
        technical_data = market_data_service.get_technical_data(ticker)
        sentiment_data = market_data_service.get_sentiment_data(ticker)
        # Generate memo using enhanced orchestrator
        memo_data = enhanced_orchestrator.generate_enhanced_memo(ticker, fundamental_data, technical_data, sentiment_data)
        # Update db_memo with all fields from memo_data
        db_memo.fundamental_analysis = memo_data.get('financial_analysis', "") or ""
        db_memo.technical_analysis = memo_data.get('technical_analysis', "") or ""
        db_memo.sentiment_analysis = memo_data.get('sentiment_analysis', "") or ""
        db_memo.chief_strategist_analysis = memo_data.get('investment_thesis', "") or ""
        db_memo.risk_assessment = memo_data.get('risks_and_mitigation', "") or ""
        # Ensure recommendation is valid
        recommendation = memo_data.get('recommendation', "Hold") or "Hold"
        valid_recommendations = ["Buy", "Sell", "Hold"]
        if recommendation not in valid_recommendations:
            print(f"Invalid recommendation from orchestrator: '{recommendation}', defaulting to 'Hold'")
            recommendation = "Hold"
        db_memo.recommendation = recommendation
        db_memo.position_size = memo_data.get('position_size')
        db_memo.confidence_score = memo_data.get('confidence_score')
        db_memo.market_opportunity = memo_data.get('market_opportunity', "") or ""
        db_memo.business_overview = memo_data.get('business_overview', "") or ""
        db_memo.competitive_analysis = memo_data.get('competitive_analysis', "") or ""
        db_memo.management_team = memo_data.get('management_team', "") or ""
        db_memo.investment_thesis = memo_data.get('investment_thesis', "") or ""
        db_memo.risks_and_mitigation = memo_data.get('risks_and_mitigation', "") or ""
        db_memo.valuation_and_deal_structure = memo_data.get('valuation_and_deal_structure', "") or ""
        db_memo.source_citations = json.dumps(memo_data.get('source_citations', []) or [])
        db_memo.status = memo_data.get('status', 'complete') or 'complete'
        db.commit()
        db.refresh(db_memo)
        return {"message": f"Enhanced memo generated for {ticker.upper()}", "memo_id": db_memo.id}
    except Exception as e:
        db_memo.status = "error"
        db_memo.fundamental_analysis = f"Enhanced memo generation failed: {str(e)}"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating enhanced memo: {str(e)}"
        )

@app.post("/memos/{memo_id}/decision")
async def make_decision(
    memo_id: int,
    decision: MemoDecision,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Make a decision on a memo (approve/reject)."""
    memo = db.query(DBMemo).filter(
        DBMemo.id == memo_id,
        DBMemo.user_id == current_user.id
    ).first()
    
    if not memo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memo not found"
        )
    
    if memo.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Memo has already been decided on"
        )
    
    # Only allow approval if recommendation is valid
    valid_recommendations = ["Buy", "Sell", "Hold"]
    if decision.decision.lower() == "approve":
        if memo.recommendation not in valid_recommendations:
            memo.status = "rejected"
            memo.pm_decision = "auto-rejected: invalid recommendation"
            memo.pm_decision_at = datetime.now()
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot approve memo: invalid recommendation '{memo.recommendation}'. Only Buy, Sell, or Hold are allowed."
            )
        else:
            memo.status = "approved"
            memo.pm_decision = decision.decision
            memo.pm_decision_at = datetime.now()
            db.commit()
            return {"message": "Memo approved."}
    else:
        memo.status = "rejected"
        memo.pm_decision = decision.decision
        memo.pm_decision_at = datetime.now()
        db.commit()
        return {"message": "Memo rejected."}

@app.post("/memos/{memo_id}/outcome")
async def update_memo_outcome(
    memo_id: int,
    outcome_update: MemoOutcomeUpdate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the outcome and performance of a memo."""
    memo = db.query(DBMemo).filter(
        DBMemo.id == memo_id,
        DBMemo.user_id == current_user.id
    ).first()
    
    if not memo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memo not found"
        )
    
    # Update memory system if available
    if memo.memory_situation_id and enhanced_orchestrator.memory_system:
        try:
            enhanced_orchestrator.update_memo_outcome(
                memo.memory_situation_id,
                outcome_update.outcome,
                outcome_update.performance_score
            )
        except Exception as e:
            print(f"Error updating memory outcome: {e}")
    
    return {"message": "Memo outcome updated"}

@app.get("/memory/insights")
async def get_memory_insights(
    ticker: Optional[str] = None,
    current_user: DBUser = Depends(get_current_user)
):
    """Get insights from the memory system."""
    try:
        insights = enhanced_orchestrator.get_memory_insights(ticker)
        return MemoryInsights(**insights)
    except Exception as e:
        return MemoryInsights(
            performance_insights={},
            lessons_learned=[],
            memory_enabled=False,
            error=str(e)
        )

@app.get("/system/configuration")
async def get_system_configuration():
    """Get current system configuration."""
    return AgentConfiguration(
        enable_memory=True,
        enable_research_debate=True,
        enable_risk_debate=True,
        debate_rounds=2,
        memory_retention_days=730
    )

@app.delete("/memos/{memo_id}")
async def delete_memo(
    memo_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a memo."""
    memo = db.query(DBMemo).filter(
        DBMemo.id == memo_id,
        DBMemo.user_id == current_user.id
    ).first()
    
    if not memo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Memo not found"
        )
    
    db.delete(memo)
    db.commit()
    
    return {"message": "Memo deleted"}

@app.post("/memos/cleanup-pending")
async def cleanup_pending_memos(
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clean up any stuck pending memos."""
    pending_memos = db.query(DBMemo).filter(
        DBMemo.user_id == current_user.id,
        DBMemo.status == "pending"
    ).all()
    
    for memo in pending_memos:
        memo.status = "rejected"
        memo.fundamental_analysis = "Memo generation was interrupted"
    
    db.commit()
    
    return {"message": f"Cleaned up {len(pending_memos)} pending memos"}

@app.post("/memos/generate-all")
async def generate_all_memos(
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate memos for all tickers in watchlist."""
    watchlist = db.query(DBWatchlist).filter(DBWatchlist.user_id == current_user.id).all()
    
    if not watchlist:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Watchlist is empty"
        )
    
    generated_count = 0
    errors = []
    
    print(f"Starting memo generation for {len(watchlist)} tickers: {[item.ticker for item in watchlist]}")
    
    for item in watchlist:
        try:
            print(f"Processing ticker: {item.ticker}")
            
            # Check if memo already exists for today
            today = date.today()
            existing_memo = db.query(DBMemo).filter(
                DBMemo.ticker == item.ticker,
                DBMemo.user_id == current_user.id,
                DBMemo.date == today
            ).first()
            
            if existing_memo:
                print(f"Skipping {item.ticker} - memo already exists for today")
                continue  # Skip if memo already exists
            
            print(f"Fetching market data for {item.ticker}")
            
            # Get market data
            fundamental_data = market_data_service.get_fundamental_data(item.ticker)
            technical_data = market_data_service.get_technical_data(item.ticker)
            sentiment_data = market_data_service.get_sentiment_data(item.ticker)
            
            print(f"Market data fetched for {item.ticker}. Generating memo...")
            
            # Generate memo using basic orchestrator (more reliable)
            try:
                memo_data = orchestrator.generate_memo(
                    item.ticker, fundamental_data, technical_data, sentiment_data
                )
                print(f"Memo generated for {item.ticker}. Saving to database...")
            except Exception as e:
                print(f"Enhanced orchestrator failed for {item.ticker}, falling back to basic: {str(e)}")
                # Fallback to basic orchestrator
                memo_data = orchestrator.generate_memo(
                    item.ticker, fundamental_data, technical_data, sentiment_data
                )
            
            # Ensure recommendation is valid
            recommendation = memo_data.get('recommendation', "Hold") or "Hold"
            valid_recommendations = ["Buy", "Sell", "Hold"]
            if recommendation not in valid_recommendations:
                print(f"Invalid recommendation from orchestrator: '{recommendation}', defaulting to 'Hold'")
                recommendation = "Hold"
            
            # Save to database with robust field handling
            db_memo = DBMemo(
                ticker=item.ticker,
                date=today,
                user_id=current_user.id,
                fundamental_analysis=memo_data.get('financial_analysis', "") or "",
                technical_analysis=memo_data.get('technical_analysis', "") or "",
                sentiment_analysis=memo_data.get('sentiment_analysis', "") or "",
                chief_strategist_analysis=memo_data.get('investment_thesis', "") or "",
                risk_assessment=memo_data.get('risks_and_mitigation', "") or "",
                recommendation=recommendation,
                position_size=memo_data.get('position_size'),
                confidence_score=memo_data.get('confidence_score'),
                
                # Enhanced fields (optional)
                research_debate=memo_data.get('research_debate'),
                advanced_risk_assessment=memo_data.get('advanced_risk_assessment'),
                risk_score=memo_data.get('risk_score'),
                risk_category=memo_data.get('risk_category'),
                
                # Standard memo fields
                market_opportunity=memo_data.get('market_opportunity', "") or "",
                business_overview=memo_data.get('business_overview', "") or "",
                competitive_analysis=memo_data.get('competitive_analysis', "") or "",
                management_team=memo_data.get('management_team', "") or "",
                investment_thesis=memo_data.get('investment_thesis', "") or "",
                risks_and_mitigation=memo_data.get('risks_and_mitigation', "") or "",
                valuation_and_deal_structure=memo_data.get('valuation_and_deal_structure', "") or "",
                source_citations=json.dumps(memo_data.get('source_citations', []) or []),
                
                # Memory tracking
                memory_situation_id=memo_data.get('memory_situation_id'),
                memory_decision_id=memo_data.get('memory_decision_id'),
                
                # Always set status to complete
                status="complete"
            )
            
            db.add(db_memo)
            generated_count += 1
            print(f"Successfully saved memo for {item.ticker}")
            
        except Exception as e:
            error_msg = f"Error generating memo for {item.ticker}: {str(e)}"
            print(error_msg)
            errors.append(error_msg)
    
    db.commit()
    
    print(f"Memo generation complete. Generated: {generated_count}, Errors: {len(errors)}")
    
    return {
        "message": f"Generated {generated_count} memos",
        "generated_count": generated_count,
        "errors": errors
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

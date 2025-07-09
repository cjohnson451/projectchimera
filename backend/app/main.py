from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List, Optional
import os
from dotenv import load_dotenv

from .db import get_db, create_tables, DBUser, DBWatchlist, DBMemo
from .models import (
    UserCreate, UserLogin, Token, WatchlistCreate, MemoResponse, MemoDecision,
    RecommendationType, MemoStatus
)
from .agents.orchestrator import AgentOrchestrator
from .services.market_data import MarketDataService
from .auth import create_access_token, get_current_user, get_password_hash, verify_password

load_dotenv()

# Create tables on startup
create_tables()

app = FastAPI(
    title="Project Chimera API",
    description="Multi-agent AI investment analysis platform",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Initialize services
orchestrator = AgentOrchestrator()
market_data_service = MarketDataService()

@app.get("/")
async def root():
    return {"message": "Project Chimera API - Multi-agent AI Investment Analysis"}

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
    status_filter: Optional[str] = None
):
    """Get user's memos with optional filtering."""
    query = db.query(DBMemo).filter(DBMemo.user_id == current_user.id)
    
    if ticker:
        query = query.filter(DBMemo.ticker == ticker.upper())
    
    if status_filter:
        query = query.filter(DBMemo.status == status_filter)
    
    memos = query.order_by(DBMemo.created_at.desc()).all()
    
    return [
        MemoResponse(
            id=memo.id,
            ticker=memo.ticker,
            date=memo.date,
            fundamental_analysis=memo.fundamental_analysis,
            technical_analysis=memo.technical_analysis,
            sentiment_analysis=memo.sentiment_analysis,
            chief_strategist_analysis=memo.chief_strategist_analysis,
            risk_assessment=memo.risk_assessment,
            recommendation=RecommendationType(memo.recommendation),
            position_size=memo.position_size,
            confidence_score=memo.confidence_score,
            status=MemoStatus(memo.status),
            created_at=memo.created_at
        )
        for memo in memos
    ]

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
    
    return MemoResponse(
        id=memo.id,
        ticker=memo.ticker,
        date=memo.date,
        fundamental_analysis=memo.fundamental_analysis,
        technical_analysis=memo.technical_analysis,
        sentiment_analysis=memo.sentiment_analysis,
        chief_strategist_analysis=memo.chief_strategist_analysis,
        risk_assessment=memo.risk_assessment,
        recommendation=RecommendationType(memo.recommendation),
        position_size=memo.position_size,
        confidence_score=memo.confidence_score,
        status=MemoStatus(memo.status),
        created_at=memo.created_at
    )

@app.post("/memos/generate/{ticker}")
async def generate_memo(
    ticker: str,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a new investment memo for a ticker."""
    # Check if ticker is in user's watchlist
    watchlist_item = db.query(DBWatchlist).filter(
        DBWatchlist.user_id == current_user.id,
        DBWatchlist.ticker == ticker.upper()
    ).first()
    
    if not watchlist_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticker not in watchlist"
        )
    
    try:
        # Get market data
        market_data = market_data_service.get_complete_data(ticker.upper())
        
        # Generate memo using agents
        memo_data = orchestrator.generate_memo(
            ticker=ticker.upper(),
            fundamental_data=market_data['fundamental'],
            technical_data=market_data['technical'],
            sentiment_data=market_data['sentiment']
        )
        
        # Save memo to database
        db_memo = DBMemo(
            ticker=ticker.upper(),
            date=memo_data['date'],
            user_id=current_user.id,
            fundamental_analysis=memo_data['fundamental_analysis'],
            technical_analysis=memo_data['technical_analysis'],
            sentiment_analysis=memo_data['sentiment_analysis'],
            chief_strategist_analysis=memo_data['chief_strategist_analysis'],
            risk_assessment=memo_data['risk_assessment'],
            recommendation=memo_data['recommendation'],
            position_size=memo_data['position_size'],
            confidence_score=memo_data['confidence_score']
        )
        
        db.add(db_memo)
        db.commit()
        db.refresh(db_memo)
        
        return {
            "message": f"Generated memo for {ticker.upper()}",
            "memo_id": db_memo.id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating memo: {str(e)}"
        )

@app.post("/memos/{memo_id}/decision")
async def make_decision(
    memo_id: int,
    decision: MemoDecision,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve or reject a memo."""
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
            detail="Memo has already been decided"
        )
    
    # Update memo with decision
    memo.status = decision.decision
    memo.pm_decision = decision.decision
    memo.pm_decision_at = datetime.now()
    
    db.commit()
    
    return {
        "message": f"Memo {decision.decision}",
        "memo_id": memo_id
    }

@app.post("/memos/generate-all")
async def generate_all_memos(
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate memos for all tickers in user's watchlist."""
    watchlist = db.query(DBWatchlist).filter(DBWatchlist.user_id == current_user.id).all()
    
    if not watchlist:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Watchlist is empty"
        )
    
    generated_count = 0
    errors = []
    
    for item in watchlist:
        try:
            # Check if memo already exists for today
            existing_memo = db.query(DBMemo).filter(
                DBMemo.user_id == current_user.id,
                DBMemo.ticker == item.ticker,
                DBMemo.date == date.today()
            ).first()
            
            if existing_memo:
                continue
            
            # Get market data
            market_data = market_data_service.get_complete_data(item.ticker)
            
            # Generate memo using agents
            memo_data = orchestrator.generate_memo(
                ticker=item.ticker,
                fundamental_data=market_data['fundamental'],
                technical_data=market_data['technical'],
                sentiment_data=market_data['sentiment']
            )
            
            # Save memo to database
            db_memo = DBMemo(
                ticker=item.ticker,
                date=memo_data['date'],
                user_id=current_user.id,
                fundamental_analysis=memo_data['fundamental_analysis'],
                technical_analysis=memo_data['technical_analysis'],
                sentiment_analysis=memo_data['sentiment_analysis'],
                chief_strategist_analysis=memo_data['chief_strategist_analysis'],
                risk_assessment=memo_data['risk_assessment'],
                recommendation=memo_data['recommendation'],
                position_size=memo_data['position_size'],
                confidence_score=memo_data['confidence_score']
            )
            
            db.add(db_memo)
            generated_count += 1
            
        except Exception as e:
            errors.append(f"Error generating memo for {item.ticker}: {str(e)}")
    
    db.commit()
    
    return {
        "message": f"Generated {generated_count} new memos",
        "generated_count": generated_count,
        "errors": errors
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

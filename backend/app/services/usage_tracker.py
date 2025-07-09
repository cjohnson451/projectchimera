import os
from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.db import DBUserUsage, DBUsageLimit, SessionLocal

class UsageTracker:
    """Service for tracking and limiting user API usage and costs."""
    
    # Estimated costs per API call (in USD)
    COST_PER_CALL = {
        'finnhub_fundamental': 0.001,  # $0.001 per call
        'finnhub_technical': 0.001,    # $0.001 per call  
        'finnhub_sentiment': 0.001,    # $0.001 per call
        'openai_completion': 0.02,     # $0.02 per completion (estimated)
        'openai_embedding': 0.0001,    # $0.0001 per embedding
    }
    
    def __init__(self):
        self.db = SessionLocal()
    
    def track_api_call(self, user_id: int, api_type: str, cost: Optional[float] = None) -> bool:
        """Track an API call and check if user is within limits."""
        today = date.today()
        
        # Get or create usage record for today
        usage = self.db.query(DBUserUsage).filter(
            DBUserUsage.user_id == user_id,
            DBUserUsage.date == today
        ).first()
        
        if not usage:
            usage = DBUserUsage(
                user_id=user_id,
                date=today,
                api_calls=0,
                estimated_cost=0.0,
                memo_count=0
            )
            self.db.add(usage)
        
        # Calculate cost
        if cost is None:
            cost = self.COST_PER_CALL.get(api_type, 0.001)
        
        # Update usage
        usage.api_calls += 1
        usage.estimated_cost += cost
        
        # Check limits
        if not self._check_limits(user_id, usage):
            self.db.rollback()
            return False
        
        self.db.commit()
        return True
    
    def track_memo_generation(self, user_id: int) -> bool:
        """Track memo generation and check limits."""
        today = date.today()
        
        # Get or create usage record for today
        usage = self.db.query(DBUserUsage).filter(
            DBUserUsage.user_id == user_id,
            DBUserUsage.date == today
        ).first()
        
        if not usage:
            usage = DBUserUsage(
                user_id=user_id,
                date=today,
                api_calls=0,
                estimated_cost=0.0,
                memo_count=0
            )
            self.db.add(usage)
        
        # Update memo count
        usage.memo_count += 1
        
        # Check limits
        if not self._check_limits(user_id, usage):
            self.db.rollback()
            return False
        
        self.db.commit()
        return True
    
    def _check_limits(self, user_id: int, usage: DBUserUsage) -> bool:
        """Check if user is within their usage limits."""
        # Get user's limits
        limits = self.db.query(DBUsageLimit).filter(
            DBUsageLimit.user_id == user_id,
            DBUsageLimit.is_active == True
        ).first()
        
        if not limits:
            # Create default limits
            limits = DBUsageLimit(
                user_id=user_id,
                daily_memo_limit=10,
                daily_cost_limit=5.0,
                monthly_cost_limit=50.0
            )
            self.db.add(limits)
            self.db.commit()
        
        # Check daily memo limit
        if usage.memo_count > limits.daily_memo_limit:
            print(f"User {user_id} exceeded daily memo limit: {usage.memo_count}/{limits.daily_memo_limit}")
            return False
        
        # Check daily cost limit
        if usage.estimated_cost > limits.daily_cost_limit:
            print(f"User {user_id} exceeded daily cost limit: ${usage.estimated_cost:.2f}/${limits.daily_cost_limit:.2f}")
            return False
        
        # Check monthly cost limit
        month_start = date.today().replace(day=1)
        monthly_usage = self.db.query(DBUserUsage).filter(
            DBUserUsage.user_id == user_id,
            DBUserUsage.date >= month_start
        ).all()
        
        monthly_cost = sum(u.estimated_cost for u in monthly_usage)
        if monthly_cost > limits.monthly_cost_limit:
            print(f"User {user_id} exceeded monthly cost limit: ${monthly_cost:.2f}/${limits.monthly_cost_limit:.2f}")
            return False
        
        return True
    
    def get_user_usage(self, user_id: int, days: int = 30) -> Dict[str, Any]:
        """Get user's usage statistics."""
        start_date = date.today() - timedelta(days=days)
        
        usage_records = self.db.query(DBUserUsage).filter(
            DBUserUsage.user_id == user_id,
            DBUserUsage.date >= start_date
        ).all()
        
        total_api_calls = sum(u.api_calls for u in usage_records)
        total_cost = sum(u.estimated_cost for u in usage_records)
        total_memos = sum(u.memo_count for u in usage_records)
        
        # Get limits
        limits = self.db.query(DBUsageLimit).filter(
            DBUsageLimit.user_id == user_id
        ).first()
        
        return {
            'total_api_calls': total_api_calls,
            'total_cost': total_cost,
            'total_memos': total_memos,
            'daily_usage': [
                {
                    'date': u.date.isoformat(),
                    'api_calls': u.api_calls,
                    'cost': u.estimated_cost,
                    'memos': u.memo_count
                }
                for u in usage_records
            ],
            'limits': {
                'daily_memo_limit': limits.daily_memo_limit if limits else 10,
                'daily_cost_limit': limits.daily_cost_limit if limits else 5.0,
                'monthly_cost_limit': limits.monthly_cost_limit if limits else 50.0
            } if limits else None
        }
    
    def set_user_limits(self, user_id: int, daily_memo_limit: int = 10, 
                       daily_cost_limit: float = 5.0, monthly_cost_limit: float = 50.0) -> bool:
        """Set usage limits for a user."""
        limits = self.db.query(DBUsageLimit).filter(
            DBUsageLimit.user_id == user_id
        ).first()
        
        if limits:
            limits.daily_memo_limit = daily_memo_limit
            limits.daily_cost_limit = daily_cost_limit
            limits.monthly_cost_limit = monthly_cost_limit
        else:
            limits = DBUsageLimit(
                user_id=user_id,
                daily_memo_limit=daily_memo_limit,
                daily_cost_limit=daily_cost_limit,
                monthly_cost_limit=monthly_cost_limit
            )
            self.db.add(limits)
        
        self.db.commit()
        return True
    
    def __del__(self):
        """Cleanup database connection."""
        if hasattr(self, 'db'):
            self.db.close()

# Global instance
usage_tracker = UsageTracker() 
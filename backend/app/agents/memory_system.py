import sqlite3
import json
import hashlib
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
from app.agents.base import BaseAgent
from langchain.schema import SystemMessage, HumanMessage

class MemoryAgent(BaseAgent):
    """AI agent for analyzing and synthesizing memory insights."""
    
    def __init__(self):
        super().__init__("Memory Agent")
        self.persona = """
        You are a Memory Analysis Agent specializing in extracting insights from historical trading decisions and outcomes.
        Your role is to:
        - Analyze patterns in past decisions and their outcomes
        - Identify what worked and what didn't work
        - Provide actionable insights for future decisions
        - Connect current situations to historical precedents
        - Suggest improvements based on past performance
        
        Focus on extracting meaningful, actionable insights from historical data.
        """
    
    def get_system_prompt(self) -> str:
        """Return the system prompt that defines this agent's role and capabilities."""
        return self.persona
    
    def analyze(self, context: Dict[str, Any]) -> str:
        """Analyze memory data and provide insights."""
        
        similar_memos = context.get('similar_memos', [])
        current_memo = context.get('current_memo', {})
        analysis_type = context.get('analysis_type', 'general')
        
        if analysis_type == 'pattern_analysis':
            return self._analyze_patterns(similar_memos, current_memo)
        elif analysis_type == 'outcome_analysis':
            return self._analyze_outcomes(similar_memos, current_memo)
        elif analysis_type == 'improvement_suggestions':
            return self._suggest_improvements(similar_memos, current_memo)
        else:
            return self._general_analysis(similar_memos, current_memo)
    
    def _analyze_patterns(self, similar_memos: List[Dict], current_memo: Dict) -> str:
        """Analyze patterns in similar historical memos."""
        
        if not similar_memos:
            return "No similar historical memos found for pattern analysis."
        
        prompt = f"""
        {self.persona}
        
        Analyze patterns in the following similar historical memos:
        
        Current Memo: {json.dumps(current_memo, indent=2)}
        
        Similar Historical Memos:
        {json.dumps(similar_memos, indent=2)}
        
        Identify:
        1. Common themes and patterns across similar situations
        2. Recurring factors that led to success or failure
        3. Market conditions that influenced outcomes
        4. Decision-making patterns that worked well
        5. Warning signs or red flags that appeared in failed cases
        
        Provide specific insights that can inform the current decision.
        """
        
        return self._generate_response(prompt)
    
    def _analyze_outcomes(self, similar_memos: List[Dict], current_memo: Dict) -> str:
        """Analyze outcomes of similar historical decisions."""
        
        if not similar_memos:
            return "No similar historical memos found for outcome analysis."
        
        # Calculate success rates
        successful = [m for m in similar_memos if m.get('outcome') == 'success']
        failed = [m for m in similar_memos if m.get('outcome') == 'failure']
        pending = [m for m in similar_memos if m.get('outcome') not in ['success', 'failure']]
        
        success_rate = len(successful) / len(similar_memos) if similar_memos else 0
        
        prompt = f"""
        {self.persona}
        
        Analyze outcomes of similar historical decisions:
        
        Current Memo: {json.dumps(current_memo, indent=2)}
        
        Historical Outcomes:
        - Total Similar Cases: {len(similar_memos)}
        - Successful: {len(successful)} ({success_rate:.1%})
        - Failed: {len(failed)}
        - Pending: {len(pending)}
        
        Successful Cases: {json.dumps(successful, indent=2)}
        Failed Cases: {json.dumps(failed, indent=2)}
        
        Provide:
        1. Key factors that differentiated successful from failed cases
        2. Common characteristics of successful decisions
        3. Warning signs that appeared in failed cases
        4. Recommendations based on historical success patterns
        5. Risk factors to monitor based on failed cases
        """
        
        return self._generate_response(prompt)
    
    def _suggest_improvements(self, similar_memos: List[Dict], current_memo: Dict) -> str:
        """Suggest improvements based on historical performance."""
        
        if not similar_memos:
            return "No similar historical memos found for improvement suggestions."
        
        prompt = f"""
        {self.persona}
        
        Suggest improvements for the current memo based on historical performance:
        
        Current Memo: {json.dumps(current_memo, indent=2)}
        
        Historical Performance: {json.dumps(similar_memos, indent=2)}
        
        Provide specific suggestions for:
        1. Improving the investment thesis based on historical patterns
        2. Adjusting position sizing based on past outcomes
        3. Adding risk management measures that worked in similar cases
        4. Monitoring factors that were important in historical decisions
        5. Avoiding mistakes that led to failures in similar situations
        6. Leveraging successful strategies from past decisions
        
        Focus on actionable, specific improvements.
        """
        
        return self._generate_response(prompt)
    
    def _general_analysis(self, similar_memos: List[Dict], current_memo: Dict) -> str:
        """Provide general memory analysis."""
        
        if not similar_memos:
            return "No similar historical memos found for analysis."
        
        prompt = f"""
        {self.persona}
        
        Provide a comprehensive analysis of historical context for the current decision:
        
        Current Memo: {json.dumps(current_memo, indent=2)}
        
        Similar Historical Memos: {json.dumps(similar_memos, indent=2)}
        
        Provide insights on:
        1. How this situation compares to historical precedents
        2. What we can learn from similar past decisions
        3. Key differences that might affect the outcome
        4. Historical success factors that apply here
        5. Risk factors that emerged in similar situations
        6. Recommendations based on historical patterns
        
        Structure your response with clear sections and actionable insights.
        """
        
        return self._generate_response(prompt)
    
    def _generate_response(self, prompt: str) -> str:
        """Generate response using the LLM."""
        messages = [
            SystemMessage(content=self.get_system_prompt()),
            HumanMessage(content=prompt)
        ]
        return self._call_llm(messages)

class MemorySystem:
    """Advanced memory system for storing and retrieving trading decision insights."""
    
    def __init__(self, db_path: str = "chimera.db"):
        self.db_path = db_path
        self.memory_agent = MemoryAgent()
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self._initialize_database()
    
    def _initialize_database(self):
        """Initialize the memory database with required tables."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create memory table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS memory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                memo_id TEXT UNIQUE,
                ticker TEXT,
                content TEXT,
                investment_thesis TEXT,
                risk_assessment TEXT,
                decision TEXT,
                outcome TEXT,
                outcome_date TEXT,
                performance_metrics TEXT,
                tags TEXT,
                similarity_hash TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create memory insights table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS memory_insights (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                memo_id TEXT,
                insight_type TEXT,
                insight_content TEXT,
                confidence_score REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def store_memo(self, memo_data: Dict[str, Any]) -> bool:
        """Store a memo in the memory system."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create similarity hash for content
            content_text = f"{memo_data.get('investment_thesis', '')} {memo_data.get('risk_assessment', '')}"
            similarity_hash = hashlib.md5(content_text.encode()).hexdigest()
            
            cursor.execute('''
                INSERT OR REPLACE INTO memory 
                (memo_id, ticker, content, investment_thesis, risk_assessment, decision, 
                 outcome, outcome_date, performance_metrics, tags, similarity_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                memo_data.get('id'),
                memo_data.get('ticker'),
                json.dumps(memo_data),
                memo_data.get('investment_thesis', ''),
                memo_data.get('risk_assessment', ''),
                memo_data.get('decision', ''),
                memo_data.get('outcome'),
                memo_data.get('outcome_date'),
                json.dumps(memo_data.get('performance_metrics', {})),
                json.dumps(memo_data.get('tags', [])),
                similarity_hash
            ))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            print(f"Error storing memo: {e}")
            return False
    
    def update_memo_outcome(self, memo_id: str, outcome: str, performance_metrics: Dict[str, Any] = None) -> bool:
        """Update the outcome of a stored memo."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE memory 
                SET outcome = ?, outcome_date = ?, performance_metrics = ?, updated_at = CURRENT_TIMESTAMP
                WHERE memo_id = ?
            ''', (
                outcome,
                datetime.now().isoformat(),
                json.dumps(performance_metrics or {}),
                memo_id
            ))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            print(f"Error updating memo outcome: {e}")
            return False
    
    def find_similar_memos(self, current_memo: Dict[str, Any], limit: int = 10, min_similarity: float = 0.3) -> List[Dict[str, Any]]:
        """Find similar historical memos using TF-IDF similarity."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get all historical memos
            cursor.execute('''
                SELECT memo_id, ticker, investment_thesis, risk_assessment, outcome, 
                       performance_metrics, tags, created_at
                FROM memory 
                WHERE outcome IS NOT NULL
                ORDER BY created_at DESC
            ''')
            
            historical_memos = cursor.fetchall()
            conn.close()
            
            if not historical_memos:
                return []
            
            # Prepare text for similarity analysis
            current_text = f"{current_memo.get('investment_thesis', '')} {current_memo.get('risk_assessment', '')}"
            historical_texts = [f"{memo[2]} {memo[3]}" for memo in historical_memos]
            
            # Calculate TF-IDF similarity
            all_texts = [current_text] + historical_texts
            tfidf_matrix = self.vectorizer.fit_transform(all_texts)
            
            # Calculate similarity with current memo
            current_vector = tfidf_matrix[0:1]
            historical_vectors = tfidf_matrix[1:]
            
            similarities = cosine_similarity(current_vector, historical_vectors).flatten()
            
            # Filter and sort by similarity
            similar_memos = []
            for i, similarity in enumerate(similarities):
                if similarity >= min_similarity:
                    memo_data = {
                        'memo_id': historical_memos[i][0],
                        'ticker': historical_memos[i][1],
                        'investment_thesis': historical_memos[i][2],
                        'risk_assessment': historical_memos[i][3],
                        'outcome': historical_memos[i][4],
                        'performance_metrics': json.loads(historical_memos[i][5]) if historical_memos[i][5] else {},
                        'tags': json.loads(historical_memos[i][6]) if historical_memos[i][6] else [],
                        'created_at': historical_memos[i][7],
                        'similarity_score': float(similarity)
                    }
                    similar_memos.append(memo_data)
            
            # Sort by similarity score and return top results
            similar_memos.sort(key=lambda x: x['similarity_score'], reverse=True)
            return similar_memos[:limit]
            
        except Exception as e:
            print(f"Error finding similar memos: {e}")
            return []
    
    def get_memory_insights(self, current_memo: Dict[str, Any], insight_types: List[str] = None) -> Dict[str, Any]:
        """Get comprehensive memory insights for a current memo."""
        
        if insight_types is None:
            insight_types = ['pattern_analysis', 'outcome_analysis', 'improvement_suggestions']
        
        # Find similar historical memos
        similar_memos = self.find_similar_memos(current_memo)
        
        insights = {}
        
        for insight_type in insight_types:
            context = {
                'similar_memos': similar_memos,
                'current_memo': current_memo,
                'analysis_type': insight_type
            }
            
            insights[insight_type] = self.memory_agent.analyze(context)
        
        # Add metadata
        insights['metadata'] = {
            'similar_memos_count': len(similar_memos),
            'analysis_types': insight_types,
            'generated_at': datetime.now().isoformat()
        }
        
        return insights
    
    def get_performance_analytics(self, ticker: str = None, time_period: str = "30d") -> Dict[str, Any]:
        """Get performance analytics from memory data."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Calculate date filter
            if time_period == "7d":
                date_filter = datetime.now() - timedelta(days=7)
            elif time_period == "30d":
                date_filter = datetime.now() - timedelta(days=30)
            elif time_period == "90d":
                date_filter = datetime.now() - timedelta(days=90)
            else:
                date_filter = datetime.now() - timedelta(days=30)
            
            # Build query
            query = '''
                SELECT outcome, COUNT(*) as count, 
                       AVG(CAST(performance_metrics->>'return_pct' AS REAL)) as avg_return
                FROM memory 
                WHERE outcome IS NOT NULL 
                AND created_at >= ?
            '''
            params = [date_filter.isoformat()]
            
            if ticker:
                query += " AND ticker = ?"
                params.append(ticker)
            
            query += " GROUP BY outcome"
            
            cursor.execute(query, params)
            results = cursor.fetchall()
            
            conn.close()
            
            # Process results
            analytics = {
                'total_decisions': sum(row[1] for row in results),
                'success_rate': 0,
                'avg_return': 0,
                'outcome_breakdown': {}
            }
            
            total_success = 0
            total_return = 0
            total_count = 0
            
            for outcome, count, avg_return in results:
                analytics['outcome_breakdown'][outcome] = {
                    'count': count,
                    'percentage': 0,
                    'avg_return': avg_return or 0
                }
                
                if outcome == 'success':
                    total_success += count
                    total_return += (avg_return or 0) * count
                    total_count += count
                elif outcome == 'failure':
                    total_return += (avg_return or 0) * count
                    total_count += count
            
            if analytics['total_decisions'] > 0:
                analytics['success_rate'] = total_success / analytics['total_decisions']
                analytics['avg_return'] = total_return / total_count if total_count > 0 else 0
                
                for outcome in analytics['outcome_breakdown']:
                    analytics['outcome_breakdown'][outcome]['percentage'] = (
                        analytics['outcome_breakdown'][outcome]['count'] / analytics['total_decisions']
                    )
            
            return analytics
            
        except Exception as e:
            print(f"Error getting performance analytics: {e}")
            return {}
    
    def get_learning_insights(self) -> Dict[str, Any]:
        """Get high-level learning insights from all memory data."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get recent successful and failed decisions
            cursor.execute('''
                SELECT investment_thesis, risk_assessment, outcome, performance_metrics, tags
                FROM memory 
                WHERE outcome IS NOT NULL
                ORDER BY created_at DESC
                LIMIT 50
            ''')
            
            recent_memos = cursor.fetchall()
            conn.close()
            
            if not recent_memos:
                return {"message": "No historical data available for learning insights"}
            
            # Prepare data for analysis
            successful_cases = []
            failed_cases = []
            
            for memo in recent_memos:
                memo_data = {
                    'investment_thesis': memo[0],
                    'risk_assessment': memo[1],
                    'outcome': memo[2],
                    'performance_metrics': json.loads(memo[3]) if memo[3] else {},
                    'tags': json.loads(memo[4]) if memo[4] else []
                }
                
                if memo[2] == 'success':
                    successful_cases.append(memo_data)
                elif memo[2] == 'failure':
                    failed_cases.append(memo_data)
            
            # Generate insights using memory agent
            context = {
                'similar_memos': successful_cases + failed_cases,
                'current_memo': {'type': 'learning_analysis'},
                'analysis_type': 'general'
            }
            
            learning_insights = self.memory_agent.analyze(context)
            
            return {
                'learning_insights': learning_insights,
                'data_summary': {
                    'total_analyzed': len(recent_memos),
                    'successful_cases': len(successful_cases),
                    'failed_cases': len(failed_cases),
                    'success_rate': len(successful_cases) / len(recent_memos) if recent_memos else 0
                }
            }
            
        except Exception as e:
            print(f"Error getting learning insights: {e}")
            return {"error": str(e)} 
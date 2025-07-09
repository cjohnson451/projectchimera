from typing import Dict, Any, List
from langgraph.graph import StateGraph, END
import re
from datetime import datetime

from .fundamental_analyst import FundamentalAnalyst
from .technical_analyst import TechnicalAnalyst
from .sentiment_analyst import SentimentAnalyst
from .chief_strategist import ChiefStrategist
from .risk_manager import RiskManager

class AgentOrchestrator:
    """Orchestrates the multi-agent analysis workflow using LangGraph."""
    
    def __init__(self):
        self.fundamental_analyst = FundamentalAnalyst()
        self.technical_analyst = TechnicalAnalyst()
        self.sentiment_analyst = SentimentAnalyst()
        self.chief_strategist = ChiefStrategist()
        self.risk_manager = RiskManager()
        
        # Create the workflow graph
        self.workflow = self._create_workflow()
    
    def _create_workflow(self):
        """Create the LangGraph workflow for agent orchestration."""

        # Define the nodes
        def fundamental_analysis_node(state: dict) -> dict:
            """Run fundamental analysis."""
            analysis = self.fundamental_analyst.analyze({
                'ticker': state['ticker'],
                **state['fundamental_data']
            })
            state['fundamental_analysis'] = analysis
            return state
        
        def technical_analysis_node(state: dict) -> dict:
            """Run technical analysis."""
            analysis = self.technical_analyst.analyze({
                'ticker': state['ticker'],
                **state['technical_data']
            })
            state['technical_analysis'] = analysis
            return state
        
        def sentiment_analysis_node(state: dict) -> dict:
            """Run sentiment analysis."""
            analysis = self.sentiment_analyst.analyze({
                'ticker': state['ticker'],
                **state['sentiment_data']
            })
            state['sentiment_analysis'] = analysis
            return state
        
        def chief_strategist_node(state: dict) -> dict:
            """Run chief strategist analysis."""
            analysis = self.chief_strategist.analyze({
                'ticker': state['ticker'],
                'fundamental_analysis': state['fundamental_analysis'],
                'technical_analysis': state['technical_analysis'],
                'sentiment_analysis': state['sentiment_analysis']
            })
            state['chief_strategist_analysis'] = analysis
            
            # Extract recommendation from analysis
            recommendation = self._extract_recommendation(analysis)
            state['recommendation'] = recommendation
            
            return state
        
        def risk_manager_node(state: dict) -> dict:
            """Run risk management analysis."""
            analysis = self.risk_manager.analyze({
                'ticker': state['ticker'],
                'chief_strategist_analysis': state['chief_strategist_analysis'],
                'fundamental_analysis': state['fundamental_analysis'],
                'technical_analysis': state['technical_analysis'],
                'sentiment_analysis': state['sentiment_analysis']
            })
            state['risk_assessment'] = analysis
            
            # Extract position size from analysis
            position_size = self._extract_position_size(analysis)
            state['position_size'] = position_size
            
            return state
        
        # Create the graph
        workflow = StateGraph(dict)
        
        # Add nodes
        workflow.add_node("fundamental_analysis", fundamental_analysis_node)
        workflow.add_node("technical_analysis", technical_analysis_node)
        workflow.add_node("sentiment_analysis", sentiment_analysis_node)
        workflow.add_node("chief_strategist", chief_strategist_node)
        workflow.add_node("risk_manager", risk_manager_node)
        
        # Set entry point
        workflow.set_entry_point("fundamental_analysis")
        
        # Add edges - run analysts in parallel, then chief strategist, then risk manager
        workflow.add_edge("fundamental_analysis", "technical_analysis")
        workflow.add_edge("technical_analysis", "sentiment_analysis")
        workflow.add_edge("sentiment_analysis", "chief_strategist")
        workflow.add_edge("chief_strategist", "risk_manager")
        workflow.add_edge("risk_manager", END)
        
        return workflow.compile()
    
    def _extract_recommendation(self, analysis: str) -> str:
        """Extract Buy/Sell/Hold recommendation from chief strategist analysis."""
        analysis_lower = analysis.lower()
        if 'buy' in analysis_lower and 'sell' not in analysis_lower:
            return "Buy"
        elif 'sell' in analysis_lower:
            return "Sell"
        else:
            return "Hold"
    
    def _extract_position_size(self, analysis: str) -> float:
        """Extract position size percentage from risk manager analysis."""
        # Look for percentage patterns like "5%" or "5 percent"
        percentage_pattern = r'(\d+(?:\.\d+)?)\s*%'
        matches = re.findall(percentage_pattern, analysis)
        if matches:
            return float(matches[0])
        return None
    
    def generate_memo(self, ticker: str, fundamental_data: Dict, technical_data: Dict, sentiment_data: Dict) -> Dict[str, Any]:
        """Generate a complete investment memo using all agents."""
        
        # Initialize state as a dict
        state = {
            'ticker': ticker,
            'fundamental_data': fundamental_data,
            'technical_data': technical_data,
            'sentiment_data': sentiment_data,
            'fundamental_analysis': '',
            'technical_analysis': '',
            'sentiment_analysis': '',
            'chief_strategist_analysis': '',
            'risk_assessment': '',
            'recommendation': '',
            'position_size': None,
            'confidence_score': None
        }
        
        # Run the workflow
        try:
            final_state = self.workflow.invoke(state)
            
            return {
                'ticker': ticker,
                'date': datetime.now().date(),
                'fundamental_analysis': final_state['fundamental_analysis'],
                'technical_analysis': final_state['technical_analysis'],
                'sentiment_analysis': final_state['sentiment_analysis'],
                'chief_strategist_analysis': final_state['chief_strategist_analysis'],
                'risk_assessment': final_state['risk_assessment'],
                'recommendation': final_state['recommendation'],
                'position_size': final_state['position_size'],
                'confidence_score': final_state['confidence_score']
            }
        except Exception as e:
            return {
                'ticker': ticker,
                'date': datetime.now().date(),
                'fundamental_analysis': f"Error in fundamental analysis: {str(e)}",
                'technical_analysis': f"Error in technical analysis: {str(e)}",
                'sentiment_analysis': f"Error in sentiment analysis: {str(e)}",
                'chief_strategist_analysis': f"Error in chief strategist analysis: {str(e)}",
                'risk_assessment': f"Error in risk assessment: {str(e)}",
                'recommendation': "Hold",
                'position_size': None,
                'confidence_score': None
            } 
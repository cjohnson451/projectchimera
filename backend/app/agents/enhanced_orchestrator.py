from typing import Dict, Any, List, Optional
from langgraph.graph import StateGraph, END
import re
from datetime import datetime
import json

from app.agents.fundamental_analyst import FundamentalAnalyst
from app.agents.technical_analyst import TechnicalAnalyst
from app.agents.sentiment_analyst import SentimentAnalyst
from app.agents.chief_strategist import ChiefStrategist
from app.agents.risk_manager import RiskManager
from app.agents.research_team import ResearchTeam
from app.agents.advanced_risk_manager import AdvancedRiskManager
from app.agents.memory_system import MemorySystem

class EnhancedAgentOrchestrator:
    """Enhanced orchestrator that integrates all advanced features with the existing agent system."""
    
    def __init__(self, enable_memory: bool = True, enable_research_debate: bool = True, enable_risk_debate: bool = True):
        # Core agents
        self.fundamental_analyst = FundamentalAnalyst()
        self.technical_analyst = TechnicalAnalyst()
        self.sentiment_analyst = SentimentAnalyst()
        self.chief_strategist = ChiefStrategist()
        self.risk_manager = RiskManager()
        
        # Advanced components
        self.research_team = ResearchTeam()
        self.advanced_risk_manager = AdvancedRiskManager()
        self.memory_system = MemorySystem() if enable_memory else None
        
        # Configuration
        self.enable_memory = enable_memory
        self.enable_research_debate = enable_research_debate
        self.enable_risk_debate = enable_risk_debate
        
        # Create the enhanced workflow
        self.workflow = self._create_enhanced_workflow()
    
    def _create_enhanced_workflow(self):
        """Create the enhanced LangGraph workflow with all advanced features."""
        
        # Define the nodes
        def fundamental_analysis_node(state: dict) -> dict:
            """Run fundamental analysis with memory context."""
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
        
        def research_debate_node(state: dict) -> dict:
            """Run research team debate if enabled."""
            if not self.enable_research_debate:
                state['research_debate'] = {
                    'bull_analysis': 'Research debate disabled',
                    'bear_analysis': 'Research debate disabled',
                    'debate_synthesis': 'Research debate disabled',
                    'key_points': {'bull_key_points': [], 'bear_key_points': [], 'consensus_areas': []}
                }
                return state
            
            # Prepare context for research debate
            context = {
                'ticker': state['ticker'],
                'fundamental_analysis': state['fundamental_analysis'],
                'technical_analysis': state['technical_analysis'],
                'sentiment_analysis': state['sentiment_analysis']
            }
            
            # Add memory context if available
            if self.memory_system:
                current_memo = {
                    'investment_thesis': f"{state['fundamental_analysis']} {state['technical_analysis']} {state['sentiment_analysis']}",
                    'risk_assessment': 'Analysis in progress'
                }
                memory_insights = self.memory_system.get_memory_insights(current_memo)
                context['memory_context'] = memory_insights.get('general_analysis', 'No historical context available')
            
            debate_result = self.research_team.conduct_research_debate(context, debate_rounds=2)
            state['research_debate'] = debate_result
            return state
        
        def chief_strategist_node(state: dict) -> dict:
            """Run chief strategist with enhanced context."""
            # Prepare enhanced context including research debate
            context = {
                'ticker': state['ticker'],
                'fundamental_analysis': state['fundamental_analysis'],
                'technical_analysis': state['technical_analysis'],
                'sentiment_analysis': state['sentiment_analysis']
            }
            
            # Add research debate results if available
            if 'research_debate' in state:
                context['bull_analysis'] = state['research_debate']['bull_analysis']
                context['bear_analysis'] = state['research_debate']['bear_analysis']
                context['debate_synthesis'] = state['research_debate']['debate_synthesis']
            
            # Add memory context if available
            if self.memory_system:
                current_memo = {
                    'investment_thesis': f"{state['fundamental_analysis']} {state['technical_analysis']} {state['sentiment_analysis']}",
                    'risk_assessment': 'Analysis in progress'
                }
                memory_insights = self.memory_system.get_memory_insights(current_memo)
                context['memory_context'] = memory_insights.get('general_analysis', 'No historical context available')
            
            analysis = self.chief_strategist.analyze(context)
            state['chief_strategist_analysis'] = analysis
            
            # Extract recommendation and confidence
            recommendation = self._extract_recommendation(analysis)
            state['recommendation'] = recommendation
            confidence_score = self._extract_confidence_score(analysis)
            state['confidence_score'] = confidence_score
            
            return state
        
        def advanced_risk_management_node(state: dict) -> dict:
            """Run advanced risk management with multiple perspectives."""
            if not self.enable_risk_debate:
                # Fall back to basic risk management
                analysis = self.risk_manager.analyze({
                    'ticker': state['ticker'],
                    'chief_strategist_analysis': state['chief_strategist_analysis'],
                    'fundamental_analysis': state['fundamental_analysis'],
                    'technical_analysis': state['technical_analysis'],
                    'sentiment_analysis': state['sentiment_analysis']
                })
                state['risk_assessment'] = analysis
                position_size = self._extract_position_size(analysis)
                state['position_size'] = position_size
                return state
            
            # Prepare context for advanced risk management
            context = {
                'ticker': state['ticker'],
                'investment_thesis': state['chief_strategist_analysis'],
                'market_conditions': f"Fundamental: {state['fundamental_analysis'][:500]}... Technical: {state['technical_analysis'][:500]}... Sentiment: {state['sentiment_analysis'][:500]}...",
                'proposed_position': {
                    'recommendation': state['recommendation'],
                    'confidence': state['confidence_score'],
                    'size': 5.0  # Default position size
                }
            }
            
            # Add memory context if available
            if self.memory_system:
                current_memo = {
                    'investment_thesis': f"{state['fundamental_analysis']} {state['technical_analysis']} {state['sentiment_analysis']}",
                    'risk_assessment': 'Analysis in progress'
                }
                memory_insights = self.memory_system.get_memory_insights(current_memo)
                context['memory_context'] = memory_insights.get('general_analysis', 'No historical context available')
            
            risk_result = self.advanced_risk_manager.conduct_risk_debate(context, debate_rounds=2)
            state['advanced_risk_assessment'] = risk_result
            
            # Extract final recommendation from advanced risk management
            final_recommendation = risk_result['final_recommendation']
            state['position_size'] = final_recommendation['position_size']
            state['risk_score'] = final_recommendation['risk_score']
            state['risk_category'] = final_recommendation['risk_category']
            
            # Keep basic risk assessment for compatibility
            state['risk_assessment'] = risk_result['risk_synthesis']
            
            return state
        
        def memory_storage_node(state: dict) -> dict:
            """Store analysis results in memory system."""
            if not self.memory_system:
                return state
            
            try:
                # Store memo data
                memo_data = {
                    'id': f"{state['ticker']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    'ticker': state['ticker'],
                    'investment_thesis': state['chief_strategist_analysis'],
                    'risk_assessment': state['risk_assessment'],
                    'decision': state['recommendation'],
                    'fundamental_analysis': state['fundamental_analysis'],
                    'technical_analysis': state['technical_analysis'],
                    'sentiment_analysis': state['sentiment_analysis'],
                    'research_debate': state.get('research_debate', {}),
                    'advanced_risk_assessment': state.get('advanced_risk_assessment', {}),
                    'confidence_score': state.get('confidence_score'),
                    'position_size': state.get('position_size'),
                    'tags': ['enhanced_analysis', state['ticker']]
                }
                
                success = self.memory_system.store_memo(memo_data)
                if success:
                    state['memory_stored'] = True
                    state['memo_id'] = memo_data['id']
                else:
                    state['memory_stored'] = False
                    
            except Exception as e:
                print(f"Error storing in memory: {e}")
                state['memory_stored'] = False
            
            return state
        
        # Create the workflow graph
        workflow = StateGraph(dict)
        
        # Add nodes
        workflow.add_node("fundamental_analysis", fundamental_analysis_node)
        workflow.add_node("technical_analysis", technical_analysis_node)
        workflow.add_node("sentiment_analysis", sentiment_analysis_node)
        workflow.add_node("research_debate", research_debate_node)
        workflow.add_node("chief_strategist", chief_strategist_node)
        workflow.add_node("advanced_risk_management", advanced_risk_management_node)
        workflow.add_node("memory_storage", memory_storage_node)
        
        # Define the workflow
        workflow.set_entry_point("fundamental_analysis")
        workflow.add_edge("fundamental_analysis", "technical_analysis")
        workflow.add_edge("technical_analysis", "sentiment_analysis")
        workflow.add_edge("sentiment_analysis", "research_debate")
        workflow.add_edge("research_debate", "chief_strategist")
        workflow.add_edge("chief_strategist", "advanced_risk_management")
        workflow.add_edge("advanced_risk_management", "memory_storage")
        workflow.add_edge("memory_storage", END)
        
        return workflow.compile()
    
    def _extract_recommendation(self, analysis: str) -> str:
        """Extract recommendation from analysis text."""
        patterns = [
            r'recommend(?:ation)?[:\s]+([A-Z]+)',
            r'decision[:\s]+([A-Z]+)',
            r'action[:\s]+([A-Z]+)',
            r'([A-Z]+)\s+recommendation',
            r'([A-Z]+)\s+decision'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, analysis, re.IGNORECASE)
            if match:
                return match.group(1).upper()
        
        return "HOLD"  # Default recommendation
    
    def _extract_position_size(self, analysis: str) -> Optional[float]:
        """Extract position size from analysis text."""
        patterns = [
            r'(\d+(?:\.\d+)?)\s*%\s*(?:position|allocation|size)',
            r'position\s*size.*?(\d+(?:\.\d+)?)\s*%',
            r'recommend.*?(\d+(?:\.\d+)?)\s*%',
            r'(\d+(?:\.\d+)?)\s*%\s*of\s*portfolio'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, analysis, re.IGNORECASE)
            if match:
                return float(match.group(1))
        
        return 5.0  # Default position size
    
    def _extract_confidence_score(self, analysis: str) -> Optional[float]:
        """Extract confidence score from analysis text."""
        patterns = [
            r'confidence.*?(\d+(?:\.\d+)?)\s*%',
            r'(\d+(?:\.\d+)?)\s*%\s*confidence',
            r'confidence.*?(\d+(?:\.\d+)?)/10',
            r'(\d+(?:\.\d+)?)/10\s*confidence'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, analysis, re.IGNORECASE)
            if match:
                val = float(match.group(1))
                if val > 10:  # Assume percentage
                    return val / 100
                else:  # Assume 10-point scale
                    return val / 10
        
        return 0.7  # Default confidence score
    
    def generate_enhanced_memo(self, ticker: str, fundamental_data: Dict, technical_data: Dict, sentiment_data: Dict) -> Dict[str, Any]:
        """Generate an enhanced memo using all advanced features."""
        
        # Prepare initial state
        initial_state = {
            'ticker': ticker,
            'fundamental_data': fundamental_data,
            'technical_data': technical_data,
            'sentiment_data': sentiment_data
        }
        
        # Run the enhanced workflow
        try:
            final_state = self.workflow.invoke(initial_state)
            
            # Prepare the enhanced memo
            memo = {
                'id': f"{ticker}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                'ticker': ticker,
                'created_at': datetime.now().isoformat(),
                'fundamental_analysis': final_state['fundamental_analysis'],
                'technical_analysis': final_state['technical_analysis'],
                'sentiment_analysis': final_state['sentiment_analysis'],
                'chief_strategist_analysis': final_state['chief_strategist_analysis'],
                'recommendation': final_state['recommendation'],
                'confidence_score': final_state['confidence_score'],
                'position_size': final_state['position_size'],
                'risk_assessment': final_state['risk_assessment'],
                'research_debate': final_state.get('research_debate', {}),
                'advanced_risk_assessment': final_state.get('advanced_risk_assessment', {}),
                'memory_stored': final_state.get('memory_stored', False),
                'memo_id': final_state.get('memo_id'),
                'enhanced_features': {
                    'research_debate_enabled': self.enable_research_debate,
                    'risk_debate_enabled': self.enable_risk_debate,
                    'memory_enabled': self.enable_memory,
                    'workflow_version': 'enhanced_v2'
                }
            }
            
            # Add risk metrics if available
            if 'risk_score' in final_state:
                memo['risk_metrics'] = {
                    'risk_score': final_state['risk_score'],
                    'risk_category': final_state['risk_category']
                }
            
            return memo
            
        except Exception as e:
            print(f"Error in enhanced workflow: {e}")
            # Fallback to basic memo generation
            return self._generate_basic_memo(ticker, fundamental_data, technical_data, sentiment_data)
    
    def _generate_basic_memo(self, ticker: str, fundamental_data: Dict, technical_data: Dict, sentiment_data: Dict) -> Dict[str, Any]:
        """Generate a basic memo as fallback."""
        
        # Run basic analysis
        fundamental_analysis = self.fundamental_analyst.analyze({
            'ticker': ticker,
            **fundamental_data
        })
        
        technical_analysis = self.technical_analyst.analyze({
            'ticker': ticker,
            **technical_data
        })
        
        sentiment_analysis = self.sentiment_analyst.analyze({
            'ticker': ticker,
            **sentiment_data
        })
        
        chief_analysis = self.chief_strategist.analyze({
            'ticker': ticker,
            'fundamental_analysis': fundamental_analysis,
            'technical_analysis': technical_analysis,
            'sentiment_analysis': sentiment_analysis
        })
        
        risk_assessment = self.risk_manager.analyze({
            'ticker': ticker,
            'chief_strategist_analysis': chief_analysis,
            'fundamental_analysis': fundamental_analysis,
            'technical_analysis': technical_analysis,
            'sentiment_analysis': sentiment_analysis
        })
        
        return {
            'id': f"{ticker}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'ticker': ticker,
            'created_at': datetime.now().isoformat(),
            'fundamental_analysis': fundamental_analysis,
            'technical_analysis': technical_analysis,
            'sentiment_analysis': sentiment_analysis,
            'chief_strategist_analysis': chief_analysis,
            'recommendation': self._extract_recommendation(chief_analysis),
            'confidence_score': self._extract_confidence_score(chief_analysis),
            'position_size': self._extract_position_size(risk_assessment),
            'risk_assessment': risk_assessment,
            'enhanced_features': {
                'research_debate_enabled': False,
                'risk_debate_enabled': False,
                'memory_enabled': False,
                'workflow_version': 'basic_fallback'
            }
        }
    
    def get_memory_insights(self, ticker: str = None) -> Dict[str, Any]:
        """Get memory insights for a ticker or general insights."""
        if not self.memory_system:
            return {"error": "Memory system not enabled"}
        
        if ticker:
            return self.memory_system.get_performance_analytics(ticker)
        else:
            return self.memory_system.get_learning_insights()
    
    def update_memo_outcome(self, memo_id: str, outcome: str, performance_metrics: Dict[str, Any] = None):
        """Update the outcome of a memo in the memory system."""
        if not self.memory_system:
            return False
        
        return self.memory_system.update_memo_outcome(memo_id, outcome, performance_metrics) 
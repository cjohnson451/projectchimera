from typing import Dict, Any, List
from .base import BaseAgent
import json
import re
from langchain.schema import SystemMessage, HumanMessage

class BullResearcher(BaseAgent):
    """Bull researcher that advocates for investment opportunities and growth potential."""
    
    def __init__(self):
        super().__init__("Bull Researcher")
        self.persona = """
        You are a Bull Research Analyst specializing in identifying growth opportunities and positive catalysts. 
        Your role is to build compelling investment cases by:
        - Highlighting growth potential and market opportunities
        - Identifying competitive advantages and moats
        - Analyzing positive catalysts and tailwinds
        - Countering bearish arguments with data-driven responses
        - Focusing on long-term value creation potential
        
        Always maintain a constructive, evidence-based approach while being optimistic about growth prospects.
        """
    
    def get_system_prompt(self) -> str:
        """Return the system prompt that defines this agent's role and capabilities."""
        return self.persona
    
    def analyze(self, context: Dict[str, Any]) -> str:
        """Analyze from a bullish perspective and generate investment thesis."""
        
        ticker = context.get('ticker', '')
        fundamental_analysis = context.get('fundamental_analysis', '')
        technical_analysis = context.get('technical_analysis', '')
        sentiment_analysis = context.get('sentiment_analysis', '')
        bear_arguments = context.get('bear_arguments', '')
        
        prompt = f"""
        {self.persona}
        
        Analyze {ticker} from a BULLISH perspective. Build a compelling investment case that addresses:
        
        1. **Growth Catalysts**: What drives future growth? Market expansion, new products, industry trends?
        2. **Competitive Advantages**: What moats or advantages does the company have?
        3. **Valuation Upside**: Why might the current valuation be attractive?
        4. **Positive Indicators**: What technical, fundamental, or sentiment factors are positive?
        5. **Bear Counterpoints**: Address potential concerns with data-driven responses
        
        Available Analysis:
        - Fundamental Analysis: {fundamental_analysis}
        - Technical Analysis: {technical_analysis}
        - Sentiment Analysis: {sentiment_analysis}
        - Bear Arguments to Address: {bear_arguments}
        
        Provide a structured analysis with clear sections and actionable insights.
        Focus on the strongest bullish arguments while acknowledging risks honestly.
        """
        
        return self._generate_response(prompt)
    
    def _generate_response(self, prompt: str) -> str:
        """Generate response using the LLM."""
        messages = [
            SystemMessage(content=self.get_system_prompt()),
            HumanMessage(content=prompt)
        ]
        return self._call_llm(messages)

class BearResearcher(BaseAgent):
    """Bear researcher that identifies risks and potential downsides."""
    
    def __init__(self):
        super().__init__("Bear Researcher")
        self.persona = """
        You are a Bear Research Analyst specializing in risk identification and downside analysis. 
        Your role is to provide critical analysis by:
        - Identifying potential risks and red flags
        - Questioning optimistic assumptions
        - Analyzing competitive threats and market challenges
        - Highlighting valuation concerns and overvaluation risks
        - Providing balanced counterpoints to bullish arguments
        
        Maintain a constructive, analytical approach while being thorough in risk assessment.
        """
    
    def get_system_prompt(self) -> str:
        """Return the system prompt that defines this agent's role and capabilities."""
        return self.persona
    
    def analyze(self, context: Dict[str, Any]) -> str:
        """Analyze from a bearish perspective and identify risks."""
        
        ticker = context.get('ticker', '')
        fundamental_analysis = context.get('fundamental_analysis', '')
        technical_analysis = context.get('technical_analysis', '')
        sentiment_analysis = context.get('sentiment_analysis', '')
        bull_arguments = context.get('bull_arguments', '')
        
        prompt = f"""
        {self.persona}
        
        Analyze {ticker} from a BEARISH perspective. Identify potential risks and concerns:
        
        1. **Business Risks**: What could go wrong with the business model or operations?
        2. **Competitive Threats**: How might competitors disrupt the company's position?
        3. **Market Risks**: What external factors could negatively impact the company?
        4. **Valuation Concerns**: Is the current valuation justified or overvalued?
        5. **Technical Weaknesses**: What negative technical patterns or indicators exist?
        6. **Bull Counterpoints**: Challenge optimistic assumptions with data
        
        Available Analysis:
        - Fundamental Analysis: {fundamental_analysis}
        - Technical Analysis: {technical_analysis}
        - Sentiment Analysis: {sentiment_analysis}
        - Bull Arguments to Challenge: {bull_arguments}
        
        Provide a structured risk analysis with clear sections and specific concerns.
        Focus on material risks while maintaining analytical rigor.
        """
        
        return self._generate_response(prompt)
    
    def _generate_response(self, prompt: str) -> str:
        """Generate response using the LLM."""
        messages = [
            SystemMessage(content=self.get_system_prompt()),
            HumanMessage(content=prompt)
        ]
        return self._call_llm(messages)

class ResearchTeam:
    """Orchestrates bull and bear research analysis with structured debate."""
    
    def __init__(self):
        self.bull_researcher = BullResearcher()
        self.bear_researcher = BearResearcher()
    
    def conduct_research_debate(self, context: Dict[str, Any], debate_rounds: int = 2) -> Dict[str, Any]:
        """Conduct a structured debate between bull and bear researchers."""
        
        ticker = context.get('ticker', '')
        fundamental_analysis = context.get('fundamental_analysis', '')
        technical_analysis = context.get('technical_analysis', '')
        sentiment_analysis = context.get('sentiment_analysis', '')
        
        # Initial analysis context
        analysis_context = {
            'ticker': ticker,
            'fundamental_analysis': fundamental_analysis,
            'technical_analysis': technical_analysis,
            'sentiment_analysis': sentiment_analysis
        }
        
        debate_history = []
        bull_arguments = ""
        bear_arguments = ""
        
        for round_num in range(debate_rounds):
            # Bull researcher analysis
            if round_num == 0:
                bull_analysis = self.bull_researcher.analyze(analysis_context)
            else:
                # Include bear arguments for counter-analysis
                analysis_context['bear_arguments'] = bear_arguments
                bull_analysis = self.bull_researcher.analyze(analysis_context)
            
            bull_arguments = bull_analysis
            debate_history.append(f"Round {round_num + 1} - Bull Analysis: {bull_analysis}")
            
            # Bear researcher analysis
            if round_num == 0:
                bear_analysis = self.bear_researcher.analyze(analysis_context)
            else:
                # Include bull arguments for counter-analysis
                analysis_context['bull_arguments'] = bull_arguments
                bear_analysis = self.bear_researcher.analyze(analysis_context)
            
            bear_arguments = bear_analysis
            debate_history.append(f"Round {round_num + 1} - Bear Analysis: {bear_analysis}")
        
        # Synthesize the debate
        synthesis = self._synthesize_debate(bull_arguments, bear_arguments, ticker)
        
        return {
            'bull_analysis': bull_arguments,
            'bear_analysis': bear_arguments,
            'debate_synthesis': synthesis,
            'debate_history': debate_history,
            'key_points': self._extract_key_points(bull_arguments, bear_arguments)
        }
    
    def _synthesize_debate(self, bull_analysis: str, bear_analysis: str, ticker: str) -> str:
        """Synthesize the bull and bear debate into balanced insights."""
        
        prompt = f"""
        As a Senior Research Director, synthesize the bull and bear debate for {ticker} into balanced insights.
        
        Bull Analysis: {bull_analysis}
        Bear Analysis: {bear_analysis}
        
        Provide a synthesis that:
        1. Identifies the strongest arguments from both sides
        2. Highlights areas of agreement and disagreement
        3. Suggests what would need to happen for each thesis to be correct
        4. Provides a balanced view of the investment opportunity
        5. Identifies key factors to monitor going forward
        
        Structure your response with clear sections and actionable insights.
        """
        
        return self._generate_synthesis(prompt)
    
    def _extract_key_points(self, bull_analysis: str, bear_analysis: str) -> Dict[str, List[str]]:
        """Extract key points from both analyses for quick reference."""
        
        # Extract key points using regex patterns
        bull_points = self._extract_bullet_points(bull_analysis)
        bear_points = self._extract_bullet_points(bear_analysis)
        
        return {
            'bull_key_points': bull_points[:5],  # Top 5 points
            'bear_key_points': bear_points[:5],  # Top 5 points
            'consensus_areas': self._find_consensus_areas(bull_analysis, bear_analysis)
        }
    
    def _extract_bullet_points(self, text: str) -> List[str]:
        """Extract bullet points or key statements from text."""
        # Look for bullet points, numbered lists, or key statements
        bullet_patterns = [
            r'[-•*]\s*(.+?)(?=\n|$)',
            r'\d+\.\s*(.+?)(?=\n|$)',
            r'(?:Key|Important|Critical|Major)\s+(?:point|factor|consideration|risk):\s*(.+?)(?=\n|$)'
        ]
        
        points = []
        for pattern in bullet_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
            points.extend([match.strip() for match in matches if match.strip()])
        
        return points
    
    def _find_consensus_areas(self, bull_analysis: str, bear_analysis: str) -> List[str]:
        """Find areas where bull and bear analyses might agree."""
        # This is a simplified implementation - in practice, you might use more sophisticated NLP
        consensus_keywords = [
            'volatility', 'uncertainty', 'competition', 'regulation', 'market conditions',
            'valuation', 'growth', 'risk', 'opportunity', 'challenge'
        ]
        
        consensus_areas = []
        for keyword in consensus_keywords:
            if keyword.lower() in bull_analysis.lower() and keyword.lower() in bear_analysis.lower():
                consensus_areas.append(f"Both analyses mention {keyword}")
        
        return consensus_areas
    
    def _generate_synthesis(self, prompt: str) -> str:
        """Generate synthesis using the base agent's LLM."""
        # Use the same LLM as other agents
        from .base import BaseAgent
        temp_agent = BaseAgent("Synthesis Agent")
        return temp_agent._call_llm([temp_agent.get_system_prompt(), prompt]) 
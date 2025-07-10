from typing import Dict, Any, List, Optional
from app.agents.base import BaseAgent
import json
import re
from datetime import datetime
from langchain.schema import SystemMessage, HumanMessage

class ConservativeRiskAnalyst(BaseAgent):
    """Conservative risk analyst focused on capital preservation and downside protection."""
    
    def __init__(self):
        super().__init__("Conservative Risk Analyst")
        self.persona = """
        You are a Conservative Risk Analyst prioritizing capital preservation and downside protection.
        Your role is to:
        - Identify potential risks and worst-case scenarios
        - Advocate for smaller position sizes and defensive strategies
        - Emphasize liquidity and volatility concerns
        - Question aggressive assumptions and optimistic projections
        - Recommend hedging strategies and risk mitigation
        
        Always err on the side of caution and protect against tail risks.
        """
    
    def get_system_prompt(self) -> str:
        """Return the system prompt that defines this agent's role and capabilities."""
        return self.persona
    
    def analyze(self, context: Dict[str, Any]) -> str:
        """Analyze risks from a conservative perspective."""
        
        ticker = context.get('ticker', '')
        investment_thesis = context.get('investment_thesis', '')
        market_conditions = context.get('market_conditions', '')
        proposed_position = context.get('proposed_position', {})
        
        prompt = f"""
        {self.persona}
        
        Conduct a CONSERVATIVE risk analysis for {ticker}:
        
        1. **Downside Scenarios**: What are the worst-case outcomes? How bad could it get?
        2. **Liquidity Risks**: What happens if we need to exit quickly? Market depth concerns?
        3. **Volatility Impact**: How might market volatility affect this position?
        4. **Correlation Risks**: How does this position correlate with existing portfolio?
        5. **Position Sizing**: Is the proposed position size appropriate for risk tolerance?
        6. **Hedging Recommendations**: What hedges would protect against downside?
        
        Investment Thesis: {investment_thesis}
        Market Conditions: {market_conditions}
        Proposed Position: {proposed_position}
        
        Provide specific risk metrics, position size recommendations, and hedging strategies.
        Focus on protecting capital in adverse scenarios.
        """
        
        return self._generate_response(prompt)
    
    def _generate_response(self, prompt: str) -> str:
        """Generate response using the LLM."""
        messages = [
            SystemMessage(content=self.get_system_prompt()),
            HumanMessage(content=prompt)
        ]
        return self._call_llm(messages)

class AggressiveRiskAnalyst(BaseAgent):
    """Aggressive risk analyst focused on maximizing upside potential."""
    
    def __init__(self):
        super().__init__("Aggressive Risk Analyst")
        self.persona = """
        You are an Aggressive Risk Analyst focused on maximizing upside potential and growth opportunities.
        Your role is to:
        - Identify asymmetric risk/reward opportunities
        - Advocate for larger position sizes when conviction is high
        - Analyze upside scenarios and catalysts
        - Challenge overly conservative assumptions
        - Recommend leverage and option strategies when appropriate
        
        Focus on opportunities where the upside significantly outweighs the downside.
        """
    
    def get_system_prompt(self) -> str:
        """Return the system prompt that defines this agent's role and capabilities."""
        return self.persona
    
    def analyze(self, context: Dict[str, Any]) -> str:
        """Analyze risks from an aggressive perspective."""
        
        ticker = context.get('ticker', '')
        investment_thesis = context.get('investment_thesis', '')
        market_conditions = context.get('market_conditions', '')
        proposed_position = context.get('proposed_position', {})
        
        prompt = f"""
        {self.persona}
        
        Conduct an AGGRESSIVE risk analysis for {ticker}:
        
        1. **Upside Scenarios**: What are the best-case outcomes? How high could it go?
        2. **Asymmetric Opportunities**: Is the risk/reward ratio favorable?
        3. **Catalyst Analysis**: What events could drive significant upside?
        4. **Position Sizing**: Could we take a larger position given the opportunity?
        5. **Leverage Opportunities**: Are there ways to amplify returns?
        6. **Timing Considerations**: Is this the optimal entry point?
        
        Investment Thesis: {investment_thesis}
        Market Conditions: {market_conditions}
        Proposed Position: {proposed_position}
        
        Provide upside scenarios, optimal position sizing, and strategies to maximize returns.
        Focus on opportunities with significant asymmetric upside potential.
        """
        
        return self._generate_response(prompt)
    
    def _generate_response(self, prompt: str) -> str:
        """Generate response using the LLM."""
        messages = [
            SystemMessage(content=self.get_system_prompt()),
            HumanMessage(content=prompt)
        ]
        return self._call_llm(messages)

class NeutralRiskAnalyst(BaseAgent):
    """Neutral risk analyst providing balanced risk assessment."""
    
    def __init__(self):
        super().__init__("Neutral Risk Analyst")
        self.persona = """
        You are a Neutral Risk Analyst providing balanced, objective risk assessment.
        Your role is to:
        - Provide unbiased risk/reward analysis
        - Balance conservative and aggressive perspectives
        - Identify optimal position sizing based on risk metrics
        - Analyze both upside and downside scenarios objectively
        - Recommend balanced strategies that optimize risk-adjusted returns
        
        Maintain objectivity and provide data-driven recommendations.
        """
    
    def get_system_prompt(self) -> str:
        """Return the system prompt that defines this agent's role and capabilities."""
        return self.persona
    
    def analyze(self, context: Dict[str, Any]) -> str:
        """Analyze risks from a neutral, balanced perspective."""
        
        ticker = context.get('ticker', '')
        investment_thesis = context.get('investment_thesis', '')
        market_conditions = context.get('market_conditions', '')
        proposed_position = context.get('proposed_position', {})
        
        prompt = f"""
        {self.persona}
        
        Conduct a NEUTRAL risk analysis for {ticker}:
        
        1. **Risk/Reward Balance**: What is the optimal risk/reward profile?
        2. **Position Sizing**: What position size balances opportunity with risk?
        3. **Scenario Analysis**: Provide balanced upside and downside scenarios
        4. **Risk Metrics**: Calculate key risk metrics (VaR, Sharpe ratio, etc.)
        5. **Portfolio Impact**: How does this position affect overall portfolio risk?
        6. **Implementation Strategy**: What's the optimal way to implement this position?
        
        Investment Thesis: {investment_thesis}
        Market Conditions: {market_conditions}
        Proposed Position: {proposed_position}
        
        Provide balanced analysis with specific recommendations for optimal risk-adjusted returns.
        Focus on data-driven, objective assessment.
        """
        
        return self._generate_response(prompt)
    
    def _generate_response(self, prompt: str) -> str:
        """Generate response using the LLM."""
        messages = [
            SystemMessage(content=self.get_system_prompt()),
            HumanMessage(content=prompt)
        ]
        return self._call_llm(messages)

class AdvancedRiskManager:
    """Advanced risk management system with multiple perspectives and structured debate."""
    
    def __init__(self):
        self.conservative_analyst = ConservativeRiskAnalyst()
        self.aggressive_analyst = AggressiveRiskAnalyst()
        self.neutral_analyst = NeutralRiskAnalyst()
    
    def conduct_risk_debate(self, context: Dict[str, Any], debate_rounds: int = 2) -> Dict[str, Any]:
        """Conduct a structured risk debate between all three perspectives."""
        
        ticker = context.get('ticker', '')
        investment_thesis = context.get('investment_thesis', '')
        market_conditions = context.get('market_conditions', '')
        proposed_position = context.get('proposed_position', {})
        
        # Initial analysis context
        analysis_context = {
            'ticker': ticker,
            'investment_thesis': investment_thesis,
            'market_conditions': market_conditions,
            'proposed_position': proposed_position
        }
        
        debate_history = []
        conservative_analysis = ""
        aggressive_analysis = ""
        neutral_analysis = ""
        
        for round_num in range(debate_rounds):
            # Conservative analysis
            if round_num == 0:
                conservative_result = self.conservative_analyst.analyze(analysis_context)
            else:
                analysis_context['aggressive_arguments'] = aggressive_analysis
                analysis_context['neutral_arguments'] = neutral_analysis
                conservative_result = self.conservative_analyst.analyze(analysis_context)
            
            conservative_analysis = conservative_result
            debate_history.append(f"Round {round_num + 1} - Conservative: {conservative_result}")
            
            # Aggressive analysis
            if round_num == 0:
                aggressive_result = self.aggressive_analyst.analyze(analysis_context)
            else:
                analysis_context['conservative_arguments'] = conservative_analysis
                analysis_context['neutral_arguments'] = neutral_analysis
                aggressive_result = self.aggressive_analyst.analyze(analysis_context)
            
            aggressive_analysis = aggressive_result
            debate_history.append(f"Round {round_num + 1} - Aggressive: {aggressive_result}")
            
            # Neutral analysis
            if round_num == 0:
                neutral_result = self.neutral_analyst.analyze(analysis_context)
            else:
                analysis_context['conservative_arguments'] = conservative_analysis
                analysis_context['aggressive_arguments'] = aggressive_analysis
                neutral_result = self.neutral_analyst.analyze(analysis_context)
            
            neutral_analysis = neutral_result
            debate_history.append(f"Round {round_num + 1} - Neutral: {neutral_result}")
        
        # Synthesize the risk debate
        risk_synthesis = self._synthesize_risk_debate(
            conservative_analysis, aggressive_analysis, neutral_analysis, ticker
        )
        
        # Calculate risk metrics
        risk_metrics = self._calculate_risk_metrics(context, conservative_analysis, aggressive_analysis, neutral_analysis)
        
        return {
            'conservative_analysis': conservative_analysis,
            'aggressive_analysis': aggressive_analysis,
            'neutral_analysis': neutral_analysis,
            'risk_synthesis': risk_synthesis,
            'risk_metrics': risk_metrics,
            'debate_history': debate_history,
            'final_recommendation': self._generate_final_recommendation(risk_synthesis, risk_metrics)
        }
    
    def _synthesize_risk_debate(self, conservative: str, aggressive: str, neutral: str, ticker: str) -> str:
        """Synthesize the risk debate into actionable insights."""
        
        prompt = f"""
        As a Senior Risk Manager, synthesize the risk debate for {ticker} into actionable recommendations.
        
        Conservative Analysis: {conservative}
        Aggressive Analysis: {aggressive}
        Neutral Analysis: {neutral}
        
        Provide a synthesis that:
        1. Identifies the key risk factors and their relative importance
        2. Recommends optimal position sizing based on risk tolerance
        3. Suggests risk mitigation strategies and hedging approaches
        4. Provides clear risk/reward scenarios
        5. Outlines monitoring and exit strategies
        
        Structure your response with clear sections and specific recommendations.
        """
        
        return self._generate_synthesis(prompt)
    
    def _calculate_risk_metrics(self, context: Dict[str, Any], conservative: str, aggressive: str, neutral: str) -> Dict[str, Any]:
        """Calculate key risk metrics based on the analyses."""
        
        # Extract position size recommendations
        conservative_size = self._extract_position_size(conservative)
        aggressive_size = self._extract_position_size(aggressive)
        neutral_size = self._extract_position_size(neutral)
        
        # Extract confidence levels
        conservative_confidence = self._extract_confidence(conservative)
        aggressive_confidence = self._extract_confidence(aggressive)
        neutral_confidence = self._extract_confidence(neutral)
        
        # Calculate risk score (1-10 scale)
        risk_score = self._calculate_risk_score(conservative, aggressive, neutral)
        
        return {
            'position_size_recommendations': {
                'conservative': conservative_size,
                'aggressive': aggressive_size,
                'neutral': neutral_size,
                'recommended': neutral_size or 5.0  # Default to neutral recommendation
            },
            'confidence_levels': {
                'conservative': conservative_confidence,
                'aggressive': aggressive_confidence,
                'neutral': neutral_confidence,
                'average': (conservative_confidence + aggressive_confidence + neutral_confidence) / 3 if all([conservative_confidence, aggressive_confidence, neutral_confidence]) else None
            },
            'risk_score': risk_score,
            'risk_category': self._categorize_risk(risk_score),
            'key_risk_factors': self._extract_risk_factors(conservative, aggressive, neutral)
        }
    
    def _extract_position_size(self, analysis: str) -> Optional[float]:
        """Extract position size recommendation from analysis."""
        # Look for percentage patterns
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
        
        return None
    
    def _extract_confidence(self, analysis: str) -> Optional[float]:
        """Extract confidence level from analysis."""
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
        
        return None
    
    def _calculate_risk_score(self, conservative: str, aggressive: str, neutral: str) -> float:
        """Calculate overall risk score (1-10 scale)."""
        # Simple heuristic based on keyword analysis
        risk_keywords = ['high risk', 'volatile', 'uncertainty', 'danger', 'warning', 'caution']
        safety_keywords = ['safe', 'stable', 'conservative', 'low risk', 'defensive']
        
        risk_count = 0
        safety_count = 0
        
        for text in [conservative, aggressive, neutral]:
            text_lower = text.lower()
            risk_count += sum(1 for keyword in risk_keywords if keyword in text_lower)
            safety_count += sum(1 for keyword in safety_keywords if keyword in text_lower)
        
        # Calculate score (1 = very safe, 10 = very risky)
        if risk_count == 0 and safety_count == 0:
            return 5.0  # Neutral default
        
        total_mentions = risk_count + safety_count
        risk_ratio = risk_count / total_mentions
        
        # Map to 1-10 scale
        return 1 + (risk_ratio * 9)
    
    def _categorize_risk(self, risk_score: float) -> str:
        """Categorize risk based on score."""
        if risk_score <= 3:
            return "Low Risk"
        elif risk_score <= 6:
            return "Medium Risk"
        else:
            return "High Risk"
    
    def _extract_risk_factors(self, conservative: str, aggressive: str, neutral: str) -> List[str]:
        """Extract key risk factors from all analyses."""
        risk_factors = []
        
        # Common risk factor patterns
        patterns = [
            r'(?:risk|concern|threat|challenge):\s*(.+?)(?=\n|\.)',
            r'(?:key|major|primary)\s+(?:risk|concern):\s*(.+?)(?=\n|\.)',
            r'(-|\*)\s*(.+?)(?=\n|$)'
        ]
        
        for text in [conservative, aggressive, neutral]:
            for pattern in patterns:
                matches = re.findall(pattern, text, re.IGNORECASE | re.MULTILINE)
                for match in matches:
                    if isinstance(match, tuple):
                        factor = match[1] if len(match) > 1 else match[0]
                    else:
                        factor = match
                    if factor.strip() and len(factor.strip()) > 10:
                        risk_factors.append(factor.strip())
        
        # Remove duplicates and return top factors
        unique_factors = list(set(risk_factors))
        return unique_factors[:10]  # Top 10 factors
    
    def _generate_final_recommendation(self, synthesis: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Generate final risk recommendation."""
        
        position_size = metrics['position_size_recommendations']['recommended']
        risk_score = metrics['risk_score']
        risk_category = metrics['risk_category']
        
        # Determine recommendation based on risk metrics
        if risk_score <= 3:
            recommendation = "Proceed with position - Low risk profile"
        elif risk_score <= 6:
            recommendation = "Proceed with caution - Monitor closely"
        else:
            recommendation = "Consider reducing position size or hedging"
        
        return {
            'recommendation': recommendation,
            'position_size': position_size,
            'risk_score': risk_score,
            'risk_category': risk_category,
            'key_considerations': metrics['key_risk_factors'][:3],
            'monitoring_requirements': self._generate_monitoring_requirements(risk_score)
        }
    
    def _generate_monitoring_requirements(self, risk_score: float) -> List[str]:
        """Generate monitoring requirements based on risk score."""
        if risk_score <= 3:
            return ["Weekly portfolio review", "Monthly position assessment"]
        elif risk_score <= 6:
            return ["Daily market monitoring", "Weekly position review", "Set stop-loss levels"]
        else:
            return ["Daily position monitoring", "Real-time alerts", "Frequent rebalancing", "Hedge monitoring"]
    
    def _generate_synthesis(self, prompt: str) -> str:
        """Generate synthesis using the base agent's LLM."""
        from app.agents.base import BaseAgent
        temp_agent = BaseAgent("Risk Synthesis Agent")
        return temp_agent._call_llm([temp_agent.get_system_prompt(), prompt]) 
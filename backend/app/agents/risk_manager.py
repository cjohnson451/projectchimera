from app.agents.base import BaseAgent
from typing import Dict, Any
from langchain.schema import HumanMessage, SystemMessage

class RiskManager(BaseAgent):
    """Agent responsible for risk assessment and position sizing."""
    
    def get_system_prompt(self) -> str:
        return """You are the Chief Risk Manager at a prestigious investment firm. Your role is to evaluate investment theses and provide risk assessment and position sizing recommendations.

Key responsibilities:
1. Evaluate the risk profile of investment recommendations
2. Suggest appropriate position sizes based on risk tolerance
3. Identify and flag key risk factors
4. Ensure compliance with risk management guidelines

Your analysis should be:
- Conservative and risk-aware
- Clear and actionable (2-3 paragraphs max)
- Professional and authoritative in tone
- Focused on risk mitigation

Provide specific position size recommendations (as percentage of portfolio) and clearly identify key risks."""

    def analyze(self, data: Dict[str, Any]) -> str:
        chief_strategist_analysis = data.get('chief_strategist_analysis', 'No strategy analysis available')
        fundamental_analysis = data.get('fundamental_analysis', 'No fundamental analysis available')
        technical_analysis = data.get('technical_analysis', 'No technical analysis available')
        sentiment_analysis = data.get('sentiment_analysis', 'No sentiment analysis available')
        ticker = data.get('ticker', 'this stock')
        
        messages = [
            SystemMessage(content=self.get_system_prompt()),
            HumanMessage(content=f"""As Chief Risk Manager, please evaluate the following investment thesis for {ticker}:

CHIEF STRATEGIST ANALYSIS:
{chief_strategist_analysis}

FUNDAMENTAL ANALYSIS:
{fundamental_analysis}

TECHNICAL ANALYSIS:
{technical_analysis}

SENTIMENT ANALYSIS:
{sentiment_analysis}

Please provide:
1. Risk assessment of the proposed investment
2. Recommended position size (as percentage of portfolio)
3. Key risk factors that need monitoring
4. Risk mitigation strategies
5. Stop-loss or exit criteria if applicable

Keep your analysis to 2-3 paragraphs maximum and provide specific position size recommendations.""")
        ]
        
        return self._call_llm(messages) 
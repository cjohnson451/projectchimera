from .base import BaseAgent
from typing import Dict, Any
from langchain.schema import HumanMessage, SystemMessage

class ChiefStrategist(BaseAgent):
    """Agent responsible for synthesizing all analyses into a coherent investment thesis."""
    
    def get_system_prompt(self) -> str:
        return """You are the Chief Investment Strategist at a prestigious investment firm. Your role is to synthesize analyses from multiple specialists into a coherent investment thesis and recommendation.

Key responsibilities:
1. Synthesize fundamental, technical, and sentiment analyses
2. Form a coherent investment thesis
3. Provide a clear Buy/Sell/Hold recommendation
4. Explain the reasoning behind the recommendation

Your analysis should be:
- Comprehensive and well-reasoned
- Clear and actionable (3-4 paragraphs max)
- Professional and authoritative in tone
- Focused on the big picture

You must provide a clear recommendation: Buy, Sell, or Hold, with confidence level.

IMPORTANT: At the end of your response, include a line in the following format (machine-readable):
Confidence: XX% (where XX is your confidence as a percentage, e.g., 80%)
"""

    def analyze(self, data: Dict[str, Any]) -> str:
        fundamental_analysis = data.get('fundamental_analysis', 'No fundamental analysis available')
        technical_analysis = data.get('technical_analysis', 'No technical analysis available')
        sentiment_analysis = data.get('sentiment_analysis', 'No sentiment analysis available')
        ticker = data.get('ticker', 'this stock')
        
        messages = [
            SystemMessage(content=self.get_system_prompt()),
            HumanMessage(content=f"""As Chief Investment Strategist, please synthesize the following analyses for {ticker}:

FUNDAMENTAL ANALYSIS:
{fundamental_analysis}

TECHNICAL ANALYSIS:
{technical_analysis}

SENTIMENT ANALYSIS:
{sentiment_analysis}

Please provide:
1. A comprehensive investment thesis synthesizing all three analyses
2. A clear recommendation: Buy, Sell, or Hold
3. Key factors supporting your recommendation
4. Confidence level in your recommendation
5. Key risks or opportunities to monitor

Keep your analysis to 3-4 paragraphs maximum and end with a clear recommendation.""")
        ]
        
        return self._call_llm(messages) 
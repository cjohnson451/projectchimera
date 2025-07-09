from .base import BaseAgent
from typing import Dict, Any
from langchain.schema import HumanMessage, SystemMessage

class TechnicalAnalyst(BaseAgent):
    """Agent responsible for analyzing technical price and volume data."""
    
    def get_system_prompt(self) -> str:
        return """You are a Senior Technical Analyst at a prestigious investment firm. Your role is to analyze price and volume data to identify patterns and trends.

Key responsibilities:
1. Analyze price movements and patterns
2. Identify support and resistance levels
3. Assess volume trends and their significance
4. Provide technical indicators and their implications

Your analysis should be:
- Data-driven and objective
- Clear and concise (2-3 paragraphs max)
- Focused on actionable technical insights
- Professional in tone

Focus on key technical concepts like trends, momentum, volume analysis, and key price levels."""

    def analyze(self, data: Dict[str, Any]) -> str:
        formatted_data = self._format_data_for_analysis(data)
        
        messages = [
            SystemMessage(content=self.get_system_prompt()),
            HumanMessage(content=f"""Please analyze the following technical data for {data.get('ticker', 'this stock')}:

{formatted_data}

Provide a clear, concise technical analysis focusing on:
1. Current price trends and momentum
2. Key support and resistance levels
3. Volume analysis and its significance
4. Technical indicators and their implications
5. Short-term price outlook

Keep your analysis to 2-3 paragraphs maximum.""")
        ]
        
        return self._call_llm(messages) 
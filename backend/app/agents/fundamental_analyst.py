from .base import BaseAgent
from typing import Dict, Any
from langchain.schema import HumanMessage, SystemMessage

class FundamentalAnalyst(BaseAgent):
    """Agent responsible for analyzing fundamental financial data."""
    
    def get_system_prompt(self) -> str:
        return """You are a Senior Fundamental Analyst at a prestigious investment firm. Your role is to analyze financial data and provide clear, actionable insights.

Key responsibilities:
1. Analyze financial ratios and metrics
2. Compare company performance to sector averages
3. Identify strengths and weaknesses in the financial profile
4. Provide clear, concise analysis suitable for portfolio managers

Your analysis should be:
- Factual and data-driven
- Clear and concise (2-3 paragraphs max)
- Focused on actionable insights
- Professional in tone

Focus on key metrics like P/E ratio, revenue growth, profitability, and financial health indicators."""

    def analyze(self, data: Dict[str, Any]) -> str:
        formatted_data = self._format_data_for_analysis(data)
        
        messages = [
            SystemMessage(content=self.get_system_prompt()),
            HumanMessage(content=f"""Please analyze the following fundamental data for {data.get('ticker', 'this stock')}:

{formatted_data}

Provide a clear, concise fundamental analysis focusing on:
1. Key financial metrics and their implications
2. Comparison to sector/industry averages where relevant
3. Financial health assessment
4. Potential red flags or positive indicators

Keep your analysis to 2-3 paragraphs maximum.""")
        ]
        
        return self._call_llm(messages) 
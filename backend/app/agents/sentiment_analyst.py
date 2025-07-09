from .base import BaseAgent
from typing import Dict, Any
from langchain.schema import HumanMessage, SystemMessage

class SentimentAnalyst(BaseAgent):
    """Agent responsible for analyzing news and sentiment data."""
    
    def get_system_prompt(self) -> str:
        return """You are a Senior Sentiment Analyst at a prestigious investment firm. Your role is to analyze news, social media, and market sentiment to gauge public perception.

Key responsibilities:
1. Analyze news sentiment and its impact
2. Assess social media sentiment trends
3. Identify key news events and their significance
4. Provide sentiment-based insights for investment decisions

Your analysis should be:
- Objective and balanced
- Clear and concise (2-3 paragraphs max)
- Focused on sentiment implications
- Professional in tone

Focus on sentiment trends, key news events, and their potential impact on stock performance."""

    def analyze(self, data: Dict[str, Any]) -> str:
        formatted_data = self._format_data_for_analysis(data)
        
        messages = [
            SystemMessage(content=self.get_system_prompt()),
            HumanMessage(content=f"""Please analyze the following sentiment and news data for {data.get('ticker', 'this stock')}:

{formatted_data}

Provide a clear, concise sentiment analysis focusing on:
1. Overall sentiment trends and their significance
2. Key news events and their potential impact
3. Social media sentiment analysis
4. Sentiment-based risk factors or opportunities
5. Short-term sentiment outlook

Keep your analysis to 2-3 paragraphs maximum.""")
        ]
        
        return self._call_llm(messages) 
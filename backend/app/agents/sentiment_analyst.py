from app.agents.base import BaseAgent
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

    def _format_data_for_analysis(self, data: Dict[str, Any]) -> str:
        # Custom formatting to include links for news and tweets
        lines = []
        if 'sentiment_score' in data:
            lines.append(f"Sentiment Score: {data['sentiment_score']:.2f}")
        if 'positive_news' in data and 'negative_news' in data and 'neutral_news' in data:
            lines.append(f"News Breakdown: {data['positive_news']} positive, {data['negative_news']} negative, {data['neutral_news']} neutral")
        if 'news_summaries' in data and data['news_summaries']:
            lines.append("Recent News:")
            for item in data['news_summaries']:
                headline = item.get('headline', 'News')
                url = item.get('url', '')
                if url:
                    lines.append(f"- {headline} ([source]({url}))")
                else:
                    lines.append(f"- {headline}")
        if 'social_sentiment' in data and data['social_sentiment']:
            lines.append("Recent Social Posts:")
            for post in data['social_sentiment']:
                text = post.get('text', 'Post')
                url = post.get('url', '')
                if url:
                    lines.append(f"- {text[:80]}... ([source]({url}))")
                else:
                    lines.append(f"- {text[:80]}...")
        # Add any other fields as fallback
        for key, value in data.items():
            if key not in ['sentiment_score', 'positive_news', 'negative_news', 'neutral_news', 'news_summaries', 'social_sentiment', 'ticker']:
                lines.append(f"{key}: {value}")
        return "\n".join(lines)

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
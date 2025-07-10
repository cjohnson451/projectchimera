from app.agents.base import BaseAgent
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

    def _format_data_for_analysis(self, data: Dict[str, Any]) -> str:
        lines = []
        # Key ratios and metrics
        if 'pe_ratio' in data:
            lines.append(f"P/E Ratio: {data['pe_ratio']}")
        if 'pb_ratio' in data:
            lines.append(f"P/B Ratio: {data['pb_ratio']}")
        if 'market_cap' in data:
            lines.append(f"Market Cap: {data['market_cap']}")
        if 'revenue' in data:
            lines.append(f"Revenue (TTM): {data['revenue']}")
        if 'net_income' in data:
            lines.append(f"Net Income (TTM): {data['net_income']}")
        if 'eps' in data:
            lines.append(f"EPS (TTM): {data['eps']}")
        if 'quarterly_eps' in data:
            lines.append(f"Quarterly EPS: {data['quarterly_eps']}")
        if 'quarterly_revenue' in data:
            lines.append(f"Quarterly Revenue: {data['quarterly_revenue']}")
        if 'debt_to_equity' in data:
            lines.append(f"Debt/Equity: {data['debt_to_equity']}")
        if 'current_ratio' in data:
            lines.append(f"Current Ratio: {data['current_ratio']}")
        if 'profit_margin' in data:
            lines.append(f"Profit Margin: {data['profit_margin']}")
        if 'roe' in data:
            lines.append(f"ROE: {data['roe']}")
        if 'roa' in data:
            lines.append(f"ROA: {data['roa']}")
        # Analyst estimates and guidance
        if 'analyst_buy' in data or 'analyst_hold' in data or 'analyst_sell' in data:
            lines.append("Analyst Recommendations:")
            if 'analyst_buy' in data:
                lines.append(f"- Buy: {data['analyst_buy']}")
            if 'analyst_hold' in data:
                lines.append(f"- Hold: {data['analyst_hold']}")
            if 'analyst_sell' in data:
                lines.append(f"- Sell: {data['analyst_sell']}")
            if 'analyst_strong_buy' in data:
                lines.append(f"- Strong Buy: {data['analyst_strong_buy']}")
            if 'analyst_strong_sell' in data:
                lines.append(f"- Strong Sell: {data['analyst_strong_sell']}")
            if 'analyst_period' in data:
                lines.append(f"- Period: {data['analyst_period']}")
        if 'eps_estimate' in data or 'revenue_estimate' in data:
            lines.append("Company Guidance/Estimates:")
            if 'eps_estimate' in data:
                lines.append(f"- EPS Estimate: {data['eps_estimate']}")
            if 'revenue_estimate' in data:
                lines.append(f"- Revenue Estimate: {data['revenue_estimate']}")
            if 'guidance_period' in data:
                lines.append(f"- Period: {data['guidance_period']}")
        # Fallback for any other fields
        for key, value in data.items():
            if key not in [
                'pe_ratio','pb_ratio','market_cap','revenue','net_income','eps','quarterly_eps','quarterly_revenue',
                'debt_to_equity','current_ratio','profit_margin','roe','roa',
                'analyst_buy','analyst_hold','analyst_sell','analyst_strong_buy','analyst_strong_sell','analyst_period',
                'eps_estimate','revenue_estimate','guidance_period','ticker','company_name','sector','earnings_date']:
                lines.append(f"{key}: {value}")
        return "\n".join(lines)

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
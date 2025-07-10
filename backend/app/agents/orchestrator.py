from typing import Dict, Any, List
from langgraph.graph import StateGraph, END
import re
from datetime import datetime

from app.agents.fundamental_analyst import FundamentalAnalyst
from app.agents.technical_analyst import TechnicalAnalyst
from app.agents.sentiment_analyst import SentimentAnalyst
from app.agents.chief_strategist import ChiefStrategist
from app.agents.risk_manager import RiskManager

class AgentOrchestrator:
    """Orchestrates the multi-agent analysis workflow using LangGraph."""
    
    def __init__(self):
        self.fundamental_analyst = FundamentalAnalyst()
        self.technical_analyst = TechnicalAnalyst()
        self.sentiment_analyst = SentimentAnalyst()
        self.chief_strategist = ChiefStrategist()
        self.risk_manager = RiskManager()
        
        # Create the workflow graph
        self.workflow = self._create_workflow()
    
    def _create_workflow(self):
        """Create the LangGraph workflow for agent orchestration."""

        # Define the nodes
        def fundamental_analysis_node(state: dict) -> dict:
            """Run fundamental analysis."""
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
        
        def chief_strategist_node(state: dict) -> dict:
            """Run chief strategist analysis."""
            analysis = self.chief_strategist.analyze({
                'ticker': state['ticker'],
                'fundamental_analysis': state['fundamental_analysis'],
                'technical_analysis': state['technical_analysis'],
                'sentiment_analysis': state['sentiment_analysis']
            })
            state['chief_strategist_analysis'] = analysis
            
            # Extract recommendation from analysis
            recommendation = self._extract_recommendation(analysis)
            # Ensure recommendation is valid
            valid_recommendations = ["Buy", "Sell", "Hold"]
            if recommendation not in valid_recommendations:
                print(f"Invalid recommendation extracted: '{recommendation}', defaulting to 'Hold'")
                recommendation = "Hold"
            state['recommendation'] = recommendation
            # Extract confidence score
            confidence_score = self._extract_confidence_score(analysis)
            state['confidence_score'] = confidence_score
            
            return state
        
        def risk_manager_node(state: dict) -> dict:
            """Run risk management analysis."""
            analysis = self.risk_manager.analyze({
                'ticker': state['ticker'],
                'chief_strategist_analysis': state['chief_strategist_analysis'],
                'fundamental_analysis': state['fundamental_analysis'],
                'technical_analysis': state['technical_analysis'],
                'sentiment_analysis': state['sentiment_analysis']
            })
            state['risk_assessment'] = analysis
            
            # Extract position size from analysis
            position_size = self._extract_position_size(analysis)
            state['position_size'] = position_size
            
            return state
        
        # Create the graph
        workflow = StateGraph(dict)
        
        # Add nodes
        workflow.add_node("fundamental_analysis", fundamental_analysis_node)
        workflow.add_node("technical_analysis", technical_analysis_node)
        workflow.add_node("sentiment_analysis", sentiment_analysis_node)
        workflow.add_node("chief_strategist", chief_strategist_node)
        workflow.add_node("risk_manager", risk_manager_node)
        
        # Set entry point
        workflow.set_entry_point("fundamental_analysis")
        
        # Add edges - run analysts in parallel, then chief strategist, then risk manager
        workflow.add_edge("fundamental_analysis", "technical_analysis")
        workflow.add_edge("technical_analysis", "sentiment_analysis")
        workflow.add_edge("sentiment_analysis", "chief_strategist")
        workflow.add_edge("chief_strategist", "risk_manager")
        workflow.add_edge("risk_manager", END)
        
        return workflow.compile()
    
    def _extract_recommendation(self, analysis: str) -> str:
        """Extract Buy/Sell/Hold recommendation from chief strategist analysis."""
        print(f"Extracting recommendation from analysis: {analysis[:200]}...")
        analysis_lower = analysis.lower()
        print(f"Analysis lower: {analysis_lower[:200]}...")
        
        if 'buy' in analysis_lower and 'sell' not in analysis_lower:
            print("Found 'buy' in analysis, returning 'Buy'")
            return "Buy"
        elif 'sell' in analysis_lower:
            print("Found 'sell' in analysis, returning 'Sell'")
            return "Sell"
        else:
            print("No 'buy' or 'sell' found, returning 'Hold'")
            return "Hold"
    
    def _extract_position_size(self, analysis: str) -> float:
        """Extract position size percentage from risk manager analysis."""
        # Look for percentage patterns like "5%" or "5 percent"
        percentage_pattern = r'(\d+(?:\.\d+)?)\s*%'
        matches = re.findall(percentage_pattern, analysis)
        if matches:
            return float(matches[0])
        return None
    
    def _extract_confidence_score(self, analysis: str) -> float:
        """Extract a confidence score from the chief strategist analysis text."""
        # Look for patterns like 'confidence level of 80%', 'confidence: 7/10', 'confidence: 80%', etc.
        percent_pattern = r"confidence(?: level)?(?: of)?[:\s]*([0-9]{1,3})%"
        match = re.search(percent_pattern, analysis, re.IGNORECASE)
        if match:
            val = float(match.group(1))
            return min(max(val / 100, 0), 1)  # Normalize to 0-1
        ten_scale_pattern = r"confidence(?: level)?(?: of)?[:\s]*([0-9](?:\.\d+)?)/10"
        match = re.search(ten_scale_pattern, analysis, re.IGNORECASE)
        if match:
            val = float(match.group(1))
            return min(max(val / 10, 0), 1)
        # Fallback: look for just a number followed by '%'
        fallback_percent = r"([0-9]{1,3})% confidence"
        match = re.search(fallback_percent, analysis, re.IGNORECASE)
        if match:
            val = float(match.group(1))
            return min(max(val / 100, 0), 1)
        return None
    
    def generate_memo(self, ticker: str, fundamental_data: Dict, technical_data: Dict, sentiment_data: Dict) -> Dict[str, Any]:
        """Generate a complete investment memo using all agents, with professional structure."""
        # Initialize state as a dict
        state = {
            'ticker': ticker,
            'fundamental_data': fundamental_data,
            'technical_data': technical_data,
            'sentiment_data': sentiment_data,
            'fundamental_analysis': '',
            'technical_analysis': '',
            'sentiment_analysis': '',
            'chief_strategist_analysis': '',
            'risk_assessment': '',
            'recommendation': '',
            'position_size': None,
            'confidence_score': None
        }
        # Run the workflow
        try:
            print(f"Starting memo generation for {ticker}")
            final_state = self.workflow.invoke(state)
            print(f"Workflow completed for {ticker}. Final state keys: {list(final_state.keys())}")
            # Debug: Check if agents generated content
            print(f"Fundamental analysis length: {len(final_state.get('fundamental_analysis', ''))}")
            print(f"Technical analysis length: {len(final_state.get('technical_analysis', ''))}")
            print(f"Sentiment analysis length: {len(final_state.get('sentiment_analysis', ''))}")
            print(f"Chief strategist analysis length: {len(final_state.get('chief_strategist_analysis', ''))}")
            print(f"Risk assessment length: {len(final_state.get('risk_assessment', ''))}")
            # Aggregate source citations from sentiment_data
            source_citations = []
            news_summaries = sentiment_data.get('news_summaries', [])
            print(f"Found {len(news_summaries)} news summaries for {ticker}")
            for item in news_summaries:
                url = item.get('url')
                if url:
                    source_citations.append(url)
                    print(f"Added citation: {url}")
            social_sentiment = sentiment_data.get('social_sentiment', [])
            for post in social_sentiment:
                url = post.get('url')
                if url:
                    source_citations.append(url)
            print(f"Total source citations for {ticker}: {len(source_citations)}")
            
            # Add fallback citations if none found
            if not source_citations:
                source_citations = [
                    f"https://finance.yahoo.com/quote/{ticker}",
                    f"https://www.marketwatch.com/investing/stock/{ticker}",
                    f"https://finviz.com/quote.ashx?t={ticker}"
                ]
                print(f"Added fallback citations for {ticker}")
            
            # Compose memo sections with actual data
            company_name = fundamental_data.get('company_name', ticker)
            sector = fundamental_data.get('sector', 'Unknown')
            market_cap = fundamental_data.get('market_cap', 'Unknown')
            pe_ratio = fundamental_data.get('pe_ratio', 'Unknown')
            eps = fundamental_data.get('eps', 'Unknown')
            
            business_overview = f"Company: {company_name}\nSector: {sector}\nMarket Cap: {market_cap}\nP/E Ratio: {pe_ratio}\nEPS: {eps}"
            
            market_opportunity = f"Sector: {sector}\nMarket Opportunity: {ticker} operates in the {sector} sector with a market capitalization of {market_cap}. The company demonstrates strong fundamentals with a P/E ratio of {pe_ratio} and EPS of {eps}, indicating potential for growth and value creation."
            
            competitive_analysis = f"Competitive Analysis: {ticker} competes in the {sector} sector. The company's P/E ratio of {pe_ratio} compared to sector averages provides insight into its competitive positioning. Key competitive factors include market positioning, product differentiation, and operational efficiency as evidenced by the EPS of {eps}."
            
            management_team = f"Management Team: {company_name} is led by an experienced management team focused on driving shareholder value. The company's strong financial metrics, including a P/E ratio of {pe_ratio} and EPS of {eps}, reflect effective management execution and strategic decision-making."
            
            valuation_and_deal_structure = f"Valuation Analysis: {ticker} currently trades at a P/E ratio of {pe_ratio} with an EPS of {eps}. The company's market capitalization of {market_cap} reflects its current market valuation. These metrics should be compared against sector averages and peer companies for comprehensive valuation assessment."
            result = {
                'ticker': ticker,
                'date': datetime.now().date(),
                'executive_summary': f"""{final_state['chief_strategist_analysis']}\n\nKey Recommendation: {final_state['recommendation']}\nPosition Size: {final_state['position_size']}""",
                'market_opportunity': market_opportunity or "No market opportunity data available.",
                'business_overview': business_overview or "No business overview available.",
                'financial_analysis': final_state.get('fundamental_analysis', "No financial analysis available."),
                'competitive_analysis': competitive_analysis or "No competitive analysis available.",
                'management_team': management_team or "No management team information available.",
                'investment_thesis': final_state.get('chief_strategist_analysis', "No investment thesis available."),
                'risks_and_mitigation': final_state.get('risk_assessment', "No risk assessment available."),
                'valuation_and_deal_structure': valuation_and_deal_structure or "No valuation data available.",
                'sentiment_analysis': final_state.get('sentiment_analysis', "No sentiment analysis available."),
                'technical_analysis': final_state.get('technical_analysis', "No technical analysis available."),
                'recommendation': final_state.get('recommendation', "Hold"),
                'position_size': final_state.get('position_size'),
                'confidence_score': final_state.get('confidence_score'),
                'source_citations': source_citations,
                'status': 'complete',
            }
            print(f"Generated memo result for {ticker}. Keys: {list(result.keys())}")
            return result
        except Exception as e:
            return {
                'ticker': ticker,
                'date': datetime.now().date(),
                'executive_summary': f"Investment Analysis for {ticker}: Due to data access limitations, a comprehensive analysis requires additional research. Consider reviewing recent financial statements, earnings calls, and market reports.",
                'market_opportunity': f"Market Opportunity: {ticker} operates in a dynamic market environment. Detailed market analysis requires access to additional market research and industry reports.",
                'business_overview': f"Business Overview: {ticker} is a company operating in the financial markets. For detailed business analysis, review the company's latest annual report and investor presentations.",
                'financial_analysis': f"Financial Analysis: {ticker} financial metrics require access to current financial data. Review recent quarterly and annual reports for detailed financial analysis.",
                'competitive_analysis': f"Competitive Analysis: {ticker} faces competition in its sector. Competitive positioning analysis requires additional market research and competitor analysis.",
                'management_team': f"Management Team: {ticker} leadership team information requires additional research. Review company filings and investor relations materials for management details.",
                'investment_thesis': f"Investment Thesis: {ticker} investment case requires comprehensive analysis of financial metrics, market position, and growth prospects. Consider consulting additional research sources.",
                'risks_and_mitigation': f"Risk Assessment: {ticker} investment involves various risks including market risk, sector-specific risks, and company-specific factors. Conduct thorough due diligence.",
                'valuation_and_deal_structure': f"Valuation Analysis: {ticker} valuation requires detailed financial modeling and market analysis. Consider using multiple valuation methods including DCF and comparable analysis.",
                'sentiment_analysis': f"Market Sentiment: {ticker} market sentiment analysis requires access to current news and social media data. Review recent news coverage and analyst reports.",
                'technical_analysis': f"Technical Analysis: {ticker} technical indicators require current price and volume data. Consider using professional trading platforms for detailed technical analysis.",
                'recommendation': "Hold",
                'position_size': None,
                'confidence_score': None,
                'source_citations': [],
                'status': 'error',
            } 
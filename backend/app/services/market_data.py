import finnhub
import os
from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv
import time

load_dotenv()

class MarketDataService:
    """Service for fetching and managing market data from Finnhub."""
    
    def __init__(self):
        self.client = finnhub.Client(api_key=os.getenv("FINNHUB_API_KEY"))
    
    def get_fundamental_data(self, ticker: str) -> Dict[str, Any]:
        """Get fundamental data for a ticker, including analyst estimates and company guidance."""
        try:
            # Get company profile
            try:
                profile = self.client.company_profile2(symbol=ticker)
            except Exception as e:
                print(f"API error fetching profile for {ticker}: {str(e)}")
                profile = {}
            
            # Get financial metrics
            try:
                metrics = self.client.company_basic_financials(ticker, 'all')
            except Exception as e:
                print(f"API error fetching metrics for {ticker}: {str(e)}")
                metrics = {}
            
            # Get earnings data
            try:
                earnings = self.client.company_earnings(ticker, limit=1)
            except Exception as e:
                print(f"API error fetching earnings for {ticker}: {str(e)}")
                earnings = []
            
            # Get analyst recommendation trends
            try:
                rec_trends = self.client.recommendation_trends(ticker)
            except Exception as e:
                print(f"API error fetching recommendations for {ticker}: {str(e)}")
                rec_trends = []
            # Note: earnings_estimates method doesn't exist in Finnhub API

            fundamental_data = {
                'ticker': ticker,
                'company_name': profile.get('name', ''),
                'sector': profile.get('finnhubIndustry', ''),
                'market_cap': profile.get('marketCapitalization', None),
                'pe_ratio': metrics.get('metric', {}).get('peBasicExclExtraTTM', None),
                'revenue': metrics.get('metric', {}).get('revenueTTM', None),
                'net_income': metrics.get('metric', {}).get('netIncomeTTM', None),
                'eps': metrics.get('metric', {}).get('epsTTM', None),
                'debt_to_equity': metrics.get('metric', {}).get('totalDebt/totalEquityAnnual', None),
                'current_ratio': metrics.get('metric', {}).get('currentRatioTTM', None),
                'profit_margin': metrics.get('metric', {}).get('netProfitMarginTTM', None),
                'roe': metrics.get('metric', {}).get('roeTTM', None),
                'roa': metrics.get('metric', {}).get('roaTTM', None)
            }
            # Add earnings data if available
            if earnings and len(earnings) > 0:
                latest_earnings = earnings[0]
                fundamental_data.update({
                    'quarterly_eps': latest_earnings.get('epsActual', None),
                    'quarterly_revenue': latest_earnings.get('revenueActual', None),
                    'earnings_date': latest_earnings.get('period', None)
                })
            # Add analyst recommendation trends if available
            if rec_trends and len(rec_trends) > 0:
                latest_rec = rec_trends[0]
                fundamental_data['analyst_buy'] = latest_rec.get('buy', None)
                fundamental_data['analyst_hold'] = latest_rec.get('hold', None)
                fundamental_data['analyst_sell'] = latest_rec.get('sell', None)
                fundamental_data['analyst_strong_buy'] = latest_rec.get('strongBuy', None)
                fundamental_data['analyst_strong_sell'] = latest_rec.get('strongSell', None)
                fundamental_data['analyst_period'] = latest_rec.get('period', None)
            return fundamental_data
        except Exception as e:
            print(f"Error fetching fundamental data for {ticker}: {str(e)}")
            return {
                'ticker': ticker,
                'company_name': '',
                'sector': '',
                'market_cap': None,
                'pe_ratio': None,
                'revenue': None,
                'net_income': None,
                'eps': None
            }
    
    def get_technical_data(self, ticker: str, test_mode: bool = False) -> Dict[str, Any]:
        """Get technical data for a ticker."""
        try:
            # Get daily candles for the last 30 days
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)
            
            try:
                candles = self.client.stock_candles(
                    ticker, 
                    'D', 
                    int(start_date.timestamp()), 
                    int(end_date.timestamp())
                )
            except Exception as api_error:
                print(f"API error fetching technical data for {ticker}: {str(api_error)}")
                if test_mode:
                    return {
                        'ticker': ticker,
                        'current_price': 100.0,
                        'price_change': 0.0,
                        'price_change_pct': 0.0,
                        'sma_5': 100.0,
                        'sma_20': 100.0,
                        'current_volume': 1000000,
                        'avg_volume': 1000000,
                        'volume_ratio': 1.0,
                        'recent_high': 105.0,
                        'recent_low': 95.0,
                        'price_vs_sma5': 0.0,
                        'price_vs_sma20': 0.0,
                        'error': True,
                        'error_message': f"API error: {str(api_error)} (using placeholder data in test mode)"
                    }
                else:
                    return {
                        'ticker': ticker,
                        'error': True,
                        'error_message': f"API error fetching technical data: {str(api_error)}"
                    }
            
            if candles['s'] == 'ok' and len(candles['c']) > 0:
                # Calculate basic technical indicators
                closes = candles['c']
                volumes = candles['v']
                highs = candles['h']
                lows = candles['l']
                
                # Current price
                current_price = closes[-1]
                
                # Price change
                price_change = current_price - closes[-2] if len(closes) > 1 else 0
                price_change_pct = (price_change / closes[-2] * 100) if len(closes) > 1 else 0
                
                # Moving averages
                sma_5 = sum(closes[-5:]) / 5 if len(closes) >= 5 else current_price
                sma_20 = sum(closes[-20:]) / 20 if len(closes) >= 20 else current_price
                
                # Volume analysis
                avg_volume = sum(volumes) / len(volumes)
                current_volume = volumes[-1]
                volume_ratio = current_volume / avg_volume if avg_volume > 0 else 1
                
                # Support and resistance
                recent_high = max(highs[-5:]) if len(highs) >= 5 else current_price
                recent_low = min(lows[-5:]) if len(lows) >= 5 else current_price
                
                technical_data = {
                    'ticker': ticker,
                    'current_price': current_price,
                    'price_change': price_change,
                    'price_change_pct': price_change_pct,
                    'sma_5': sma_5,
                    'sma_20': sma_20,
                    'current_volume': current_volume,
                    'avg_volume': avg_volume,
                    'volume_ratio': volume_ratio,
                    'recent_high': recent_high,
                    'recent_low': recent_low,
                    'price_vs_sma5': ((current_price - sma_5) / sma_5 * 100) if sma_5 > 0 else 0,
                    'price_vs_sma20': ((current_price - sma_20) / sma_20 * 100) if sma_20 > 0 else 0,
                    'error': False
                }
                return technical_data
            else:
                print(f"API returned no candle data for {ticker}.")
                return {
                    'ticker': ticker,
                    'error': True,
                    'error_message': f"No candle data returned from API for {ticker}."
                }
                
        except Exception as e:
            print(f"Error fetching technical data for {ticker}: {str(e)}")
            return {
                'ticker': ticker,
                'error': True,
                'error_message': f"Exception in get_technical_data: {str(e)}"
            }
    
    def get_sentiment_data(self, ticker: str) -> Dict[str, Any]:
        """Get sentiment data for a ticker."""
        try:
            # Get company news
            end_date = datetime.now()
            start_date = end_date - timedelta(days=7)
            
            try:
                news = self.client.company_news(
                    ticker, 
                    start_date.strftime('%Y-%m-%d'), 
                    end_date.strftime('%Y-%m-%d')
                )
            except Exception as e:
                print(f"API error fetching news for {ticker}: {str(e)}")
                news = []
            
            # Note: social_sentiment method doesn't exist in Finnhub API
            
            # Analyze news sentiment
            positive_news = 0
            negative_news = 0
            neutral_news = 0
            news_summaries = []
            
            for article in news[:10]:  # Limit to 10 most recent articles
                headline = article.get('headline', '').lower()
                summary = article.get('summary', '').lower()
                
                # Simple sentiment analysis based on keywords
                positive_words = ['positive', 'growth', 'increase', 'profit', 'gain', 'up', 'higher', 'strong']
                negative_words = ['negative', 'decline', 'decrease', 'loss', 'down', 'lower', 'weak', 'risk']
                
                positive_count = sum(1 for word in positive_words if word in headline or word in summary)
                negative_count = sum(1 for word in negative_words if word in headline or word in summary)
                
                if positive_count > negative_count:
                    positive_news += 1
                elif negative_count > positive_count:
                    negative_news += 1
                else:
                    neutral_news += 1
                
                news_summaries.append({
                    'headline': article.get('headline', ''),
                    'summary': article.get('summary', ''),
                    'url': article.get('url', ''),
                    'datetime': article.get('datetime', '')
                })
            
            total_news = len(news)
            sentiment_score = (positive_news - negative_news) / total_news if total_news > 0 else 0
            
            sentiment_data = {
                'ticker': ticker,
                'total_news': total_news,
                'positive_news': positive_news,
                'negative_news': negative_news,
                'neutral_news': neutral_news,
                'sentiment_score': sentiment_score,
                'news_summaries': news_summaries[:5],  # Top 5 news items
                'social_sentiment': []  # Not available in Finnhub API
            }
            
            return sentiment_data
            
        except Exception as e:
            print(f"Error fetching sentiment data for {ticker}: {str(e)}")
            return {
                'ticker': ticker,
                'total_news': 0,
                'positive_news': 0,
                'negative_news': 0,
                'neutral_news': 0,
                'sentiment_score': 0,
                'news_summaries': [],
                'social_sentiment': []
            }
    
    def get_executives(self, ticker: str) -> list:
        """Get a list of executives for a given company."""
        # This endpoint requires premium access, so we'll return empty for now
        return []
    
    def get_peers(self, ticker: str) -> list:
        """Get a list of peer/competitor tickers for a given company."""
        # This endpoint requires premium access, so we'll return empty for now
        return []
    
    def get_valuation_data(self, ticker: str) -> dict:
        """Get valuation metrics for a given company."""
        try:
            metrics = self.client.company_basic_financials(ticker, 'all')
            metric = metrics.get('metric', {}) if metrics else {}
            return {
                'pe_ratio': metric.get('peBasicExclExtraTTM'),
                'pb_ratio': metric.get('pbAnnual'),
                'ev_to_ebitda': metric.get('evToEbitdaAnnual'),
                'ev_to_sales': metric.get('evToSalesAnnual'),
                'price_to_sales': metric.get('psAnnual'),
                'price_to_free_cash_flow': metric.get('pfcfAnnual'),
                'dividend_yield': metric.get('dividendYieldIndicatedAnnual'),
            }
        except Exception as e:
            print(f"Error fetching valuation data for {ticker}: {str(e)}")
            return {}
    
    def get_complete_data(self, ticker: str) -> Dict[str, Any]:
        """Get all data for a ticker (fundamental, technical, sentiment)."""
        # Add delay to respect API rate limits
        time.sleep(0.1)
        
        fundamental_data = self.get_fundamental_data(ticker)
        time.sleep(0.1)
        
        technical_data = self.get_technical_data(ticker)
        time.sleep(0.1)
        
        sentiment_data = self.get_sentiment_data(ticker)
        
        return {
            'fundamental': fundamental_data,
            'technical': technical_data,
            'sentiment': sentiment_data
        } 
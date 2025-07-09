#!/usr/bin/env python3
"""
Data ingestion script for Project Chimera.
Fetches market data from Finnhub and stores it in the database.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

import finnhub
from datetime import datetime, date, timedelta
from typing import List, Dict, Any
import time
from dotenv import load_dotenv

from backend.app.db import SessionLocal, DBPriceBar, DBFundamental, DBNewsItem
from backend.app.services.market_data import MarketDataService

load_dotenv()

class DataIngestionService:
    """Service for ingesting market data into the database."""
    
    def __init__(self):
        self.market_data_service = MarketDataService()
        self.db = SessionLocal()
    
    def __del__(self):
        if self.db:
            self.db.close()
    
    def ingest_price_data(self, tickers: List[str]):
        """Ingest price data for given tickers."""
        print(f"Starting price data ingestion for {len(tickers)} tickers...")
        
        for ticker in tickers:
            try:
                print(f"Processing {ticker}...")
                
                # Get technical data (includes price data)
                technical_data = self.market_data_service.get_technical_data(ticker)
                
                if technical_data.get('current_price') is not None:
                    # Check if we already have today's data
                    existing = self.db.query(DBPriceBar).filter(
                        DBPriceBar.ticker == ticker,
                        DBPriceBar.date == date.today()
                    ).first()
                    
                    if not existing:
                        # Create price bar entry
                        price_bar = DBPriceBar(
                            ticker=ticker,
                            date=date.today(),
                            open=technical_data.get('current_price', 0),  # Simplified for MVP
                            high=technical_data.get('current_price', 0),
                            low=technical_data.get('current_price', 0),
                            close=technical_data.get('current_price', 0),
                            volume=technical_data.get('current_volume', 0)
                        )
                        
                        self.db.add(price_bar)
                        print(f"Added price data for {ticker}")
                    else:
                        print(f"Price data for {ticker} already exists for today")
                
                # Rate limiting
                time.sleep(0.1)
                
            except Exception as e:
                print(f"Error processing {ticker}: {str(e)}")
                continue
        
        self.db.commit()
        print("Price data ingestion completed")
    
    def ingest_fundamental_data(self, tickers: List[str]):
        """Ingest fundamental data for given tickers."""
        print(f"Starting fundamental data ingestion for {len(tickers)} tickers...")
        
        for ticker in tickers:
            try:
                print(f"Processing {ticker}...")
                
                # Get fundamental data
                fundamental_data = self.market_data_service.get_fundamental_data(ticker)
                
                # Check if we already have today's data
                existing = self.db.query(DBFundamental).filter(
                    DBFundamental.ticker == ticker,
                    DBFundamental.date == date.today()
                ).first()
                
                if not existing:
                    # Create fundamental entry
                    fundamental = DBFundamental(
                        ticker=ticker,
                        date=date.today(),
                        revenue=fundamental_data.get('revenue'),
                        net_income=fundamental_data.get('net_income'),
                        eps=fundamental_data.get('eps'),
                        pe_ratio=fundamental_data.get('pe_ratio'),
                        market_cap=fundamental_data.get('market_cap')
                    )
                    
                    self.db.add(fundamental)
                    print(f"Added fundamental data for {ticker}")
                else:
                    print(f"Fundamental data for {ticker} already exists for today")
                
                # Rate limiting
                time.sleep(0.1)
                
            except Exception as e:
                print(f"Error processing {ticker}: {str(e)}")
                continue
        
        self.db.commit()
        print("Fundamental data ingestion completed")
    
    def ingest_news_data(self, tickers: List[str]):
        """Ingest news data for given tickers."""
        print(f"Starting news data ingestion for {len(tickers)} tickers...")
        
        for ticker in tickers:
            try:
                print(f"Processing {ticker}...")
                
                # Get sentiment data (includes news)
                sentiment_data = self.market_data_service.get_sentiment_data(ticker)
                
                # Process news items
                for news_item in sentiment_data.get('news_summaries', []):
                    # Check if news item already exists
                    existing = self.db.query(DBNewsItem).filter(
                        DBNewsItem.ticker == ticker,
                        DBNewsItem.url == news_item.get('url')
                    ).first()
                    
                    if not existing:
                        # Create news item entry
                        news_entry = DBNewsItem(
                            ticker=ticker,
                            date=datetime.now(),
                            headline=news_item.get('headline', ''),
                            summary=news_item.get('summary', ''),
                            url=news_item.get('url', ''),
                            sentiment_score=sentiment_data.get('sentiment_score')
                        )
                        
                        self.db.add(news_entry)
                
                print(f"Processed news data for {ticker}")
                
                # Rate limiting
                time.sleep(0.1)
                
            except Exception as e:
                print(f"Error processing {ticker}: {str(e)}")
                continue
        
        self.db.commit()
        print("News data ingestion completed")
    
    def ingest_all_data(self, tickers: List[str]):
        """Ingest all types of data for given tickers."""
        print(f"Starting complete data ingestion for {len(tickers)} tickers...")
        
        self.ingest_price_data(tickers)
        self.ingest_fundamental_data(tickers)
        self.ingest_news_data(tickers)
        
        print("Complete data ingestion finished")

def main():
    """Main function for data ingestion."""
    # For MVP, we'll use a sample list of S&P 500 tickers
    # In production, this would come from user watchlists
    sample_tickers = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
        'JPM', 'JNJ', 'PG', 'UNH', 'HD', 'MA', 'V', 'PYPL', 'BAC', 'ADBE',
        'CRM', 'KO'
    ]
    
    print("Project Chimera - Data Ingestion Service")
    print("=" * 50)
    
    # Initialize ingestion service
    ingestion_service = DataIngestionService()
    
    # Ingest all data
    ingestion_service.ingest_all_data(sample_tickers)
    
    print("Data ingestion completed successfully!")

if __name__ == "__main__":
    main()

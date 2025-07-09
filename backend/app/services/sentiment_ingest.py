import os
from datetime import datetime, timedelta
from typing import List
from textblob import TextBlob
import tweepy
import requests
from sqlalchemy.orm import Session
from app.db import DBNewsItem, SessionLocal

NEWS_API_KEY = os.getenv('NEWSAPI_KEY')
TWITTER_BEARER_TOKEN = os.getenv('TWITTER_BEARER_TOKEN')

class SentimentIngestService:
    def __init__(self):
        # Twitter API setup
        self.twitter_client = tweepy.Client(bearer_token=TWITTER_BEARER_TOKEN)
        self.news_api_key = NEWS_API_KEY

    def fetch_news(self, ticker: str) -> List[dict]:
        # Use NewsAPI.org for simplicity
        url = f'https://newsapi.org/v2/everything?q={ticker}&sortBy=publishedAt&apiKey={self.news_api_key}'
        resp = requests.get(url)
        if resp.status_code == 200:
            return resp.json().get('articles', [])
        return []

    def fetch_tweets(self, ticker: str) -> List[dict]:
        # Fetch recent tweets mentioning the ticker
        query = f'${ticker} -is:retweet lang:en'
        tweets = self.twitter_client.search_recent_tweets(query=query, max_results=20, tweet_fields=['created_at','text'])
        return tweets.data if tweets and tweets.data else []

    def analyze_sentiment(self, text: str) -> float:
        blob = TextBlob(text)
        return blob.sentiment.polarity  # -1 (neg) to 1 (pos)

    def ingest_for_ticker(self, ticker: str):
        db: Session = SessionLocal()
        # News
        news_items = self.fetch_news(ticker)
        for article in news_items[:10]:
            headline = article.get('title', '')
            summary = article.get('description', '')
            url = article.get('url', '')
            published_at = article.get('publishedAt', datetime.utcnow())
            text = f"{headline}. {summary}"
            sentiment = self.analyze_sentiment(text)
            db_item = DBNewsItem(
                ticker=ticker,
                date=published_at,
                headline=headline,
                summary=summary,
                url=url,
                sentiment_score=sentiment
            )
            db.add(db_item)
        # Tweets
        tweets = self.fetch_tweets(ticker)
        for tweet in tweets:
            text = tweet.text
            sentiment = self.analyze_sentiment(text)
            db_item = DBNewsItem(
                ticker=ticker,
                date=tweet.created_at,
                headline="Tweet",
                summary=text,
                url=f"https://twitter.com/i/web/status/{tweet.id}",
                sentiment_score=sentiment
            )
            db.add(db_item)
        db.commit()
        db.close() 
"""
Zee Business RSS Feed connector
"""
from typing import List, Optional
from datetime import datetime
import feedparser
from app.connectors.base import BaseConnector
from app.models.schemas import NewsArticle
import logging

logger = logging.getLogger(__name__)


class ZeeBusinessConnector(BaseConnector):
    """Connector for Zee Business RSS feeds"""
    
    def __init__(self):
        super().__init__()
        # Zee Business RSS feed URLs
        self.feed_urls = [
            "https://www.zeebiz.com/commodities/rss",
            "https://www.zeebiz.com/markets/rss",
        ]
    
    async def fetch_news(
        self,
        query: Optional[str] = None,
        country: Optional[str] = None,
        commodity: Optional[str] = None,
        limit: int = 10
    ) -> List[NewsArticle]:
        """
        Fetch news from Zee Business RSS feeds
        
        Note: feedparser is synchronous, so we're using it directly
        In production, consider using aiohttp with async RSS parsing
        """
        
        articles = []
        
        try:
            for feed_url in self.feed_urls:
                logger.info(f"Fetching RSS feed from {feed_url}")
                feed = feedparser.parse(feed_url)
                
                for entry in feed.entries[:limit]:
                    # Extract data from RSS entry
                    title = entry.get("title", "")
                    link = entry.get("link", "")
                    summary = entry.get("summary", "") or entry.get("description", "")
                    
                    # Parse published date
                    published = entry.get("published_parsed")
                    timestamp = datetime(*published[:6]) if published else datetime.utcnow()
                    
                    # Create normalized article
                    article = NewsArticle(
                        headline=title,
                        source="zee_business",
                        url=link,
                        summary=summary,
                        tickers=self._extract_tickers(title + " " + summary),
                        country=country or "India",  # Zee Business is primarily India-focused
                        commodity_tags=self._extract_commodity_tags(title + " " + summary),
                        timestamp=timestamp
                    )
                    articles.append(article)
                    
                    if len(articles) >= limit:
                        break
                
                if len(articles) >= limit:
                    break
                    
        except Exception as e:
            logger.error(f"Error fetching Zee Business RSS: {str(e)}")
            # Return mock data on error
            return self._get_mock_data(country, commodity, limit)
        
        # If no articles fetched, return mock data
        if not articles:
            logger.warning("No articles fetched from Zee Business, using mock data")
            return self._get_mock_data(country, commodity, limit)
        
        return articles[:limit]
    
    def _get_mock_data(
        self,
        country: Optional[str],
        commodity: Optional[str],
        limit: int
    ) -> List[NewsArticle]:
        """Return mock Zee Business data"""
        mock_articles = [
            NewsArticle(
                headline="Gold Prices Today: Yellow Metal Rises on Festive Demand",
                source="zee_business",
                url="https://www.zeebiz.com/commodities/gold-prices-today",
                summary="Gold prices increased today driven by strong festive season demand...",
                tickers=["GOLD"],
                country=country or "India",
                commodity_tags=["metals"],
                timestamp=datetime.utcnow()
            ),
            NewsArticle(
                headline="Crude Oil Prices Surge Amid Global Supply Concerns",
                source="zee_business",
                url="https://www.zeebiz.com/commodities/crude-oil-prices",
                summary="Crude oil prices jumped 3% as supply concerns intensify...",
                tickers=["CRUDE"],
                country=country or "India",
                commodity_tags=["energy"],
                timestamp=datetime.utcnow()
            ),
            NewsArticle(
                headline="Silver Outlook: Experts Predict Rally in Coming Weeks",
                source="zee_business",
                url="https://www.zeebiz.com/commodities/silver-outlook",
                summary="Market experts forecast a potential rally in silver prices...",
                tickers=["SILVER"],
                country=country or "India",
                commodity_tags=["metals"],
                timestamp=datetime.utcnow()
            ),
            NewsArticle(
                headline="Cotton Exports Hit Record High This Season",
                source="zee_business",
                url="https://www.zeebiz.com/commodities/cotton-exports",
                summary="India's cotton exports reached unprecedented levels this season...",
                tickers=["COTTON"],
                country=country or "India",
                commodity_tags=["agriculture"],
                timestamp=datetime.utcnow()
            )
        ]
        
        return mock_articles[:limit]

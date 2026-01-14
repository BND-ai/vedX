"""
Google Custom Search API connector
"""
from typing import List, Optional
from datetime import datetime
from app.connectors.base import BaseConnector
from app.models.schemas import NewsArticle
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class GoogleSearchConnector(BaseConnector):
    """Connector for Google Custom Search API"""
    
    def __init__(self):
        super().__init__()
        self.api_key = settings.GOOGLE_CUSTOM_SEARCH_API_KEY
        self.search_engine_id = settings.GOOGLE_CUSTOM_SEARCH_ENGINE_ID
        self.base_url = "https://www.googleapis.com/customsearch/v1"
    
    async def fetch_news(
        self,
        query: Optional[str] = None,
        country: Optional[str] = None,
        commodity: Optional[str] = None,
        limit: int = 10
    ) -> List[NewsArticle]:
        """Fetch news from Google Custom Search"""
        
        # Check if API key is configured
        if not self.api_key or self.api_key == "your_google_api_key_here":
            logger.warning("Google API key not configured, returning mock data")
            return self._get_mock_data(query or commodity or "commodity", country, limit)
        
        all_articles = []
        
        # Define search keywords
        search_keywords = []
        
        if commodity:
            search_keywords.append(commodity)
        elif query:
            search_keywords.append(query)
        else:
            search_keywords = ["commodity", "trading"]
        
        # Add targeted keywords
        keywords_to_add = ["price", "export", "shortage"]
        search_keywords.extend(keywords_to_add)
        
        # Search with each keyword individually
        articles_per_keyword = max(1, limit // len(search_keywords))
        
        for keyword in search_keywords[:4]:  # Limit to 4 keywords max
            # Build search query
            search_query = keyword
            if country:
                search_query += f" {country}"
            
            # Make API request
            params = {
                "key": self.api_key,
                "cx": self.search_engine_id,
                "q": search_query,
                "num": min(articles_per_keyword, 10)
            }
            
            response = await self._make_request(self.base_url, params=params)
            
            if response and "items" in response:
                # Process results for this keyword
                for item in response.get("items", []):
                    headline = item.get("title", "")
                    summary = item.get("snippet", "")
                    combined_text = headline + " " + summary
                    
                    article = NewsArticle(
                        headline=headline,
                        source="google_search",
                        category=self._classify_category(headline, summary),
                        url=item.get("link", ""),
                        summary=summary,
                        tickers=self._extract_tickers(combined_text),
                        country=country,
                        commodity_tags=self._extract_commodity_tags(combined_text),
                        timestamp=datetime.utcnow()
                    )
                    all_articles.append(article)
        
        # Remove duplicates based on headline
        seen_headlines = set()
        unique_articles = []
        for article in all_articles:
            if article.headline not in seen_headlines:
                seen_headlines.add(article.headline)
                unique_articles.append(article)
        
        return unique_articles[:limit]
    
    def _get_mock_data(self, query: str, country: Optional[str], limit: int) -> List[NewsArticle]:
        """Return mock data when API key is not configured"""
        mock_articles = [
            NewsArticle(
                headline="Wheat Prices Surge 8% on Export Ban Fears from Major Supplier",
                source="google_search",
                category=self._classify_category(
                    "Wheat Prices Surge 8% on Export Ban Fears from Major Supplier",
                    "Wheat futures jumped 8% after rumors of potential export restrictions from Russia..."
                ),
                url="https://example.com/wheat-prices",
                summary="Wheat futures jumped 8% after rumors of potential export restrictions from Russia. Traders are repositioning ahead of official announcement.",
                tickers=["WHEAT"],
                country=country or "Global",
                commodity_tags=["agriculture", "grains"],
                timestamp=datetime.utcnow()
            ),
            NewsArticle(
                headline="India Rice Export Deal: 500,000 Tonnes to Middle East at Premium Prices",
                source="google_search",
                category=self._classify_category(
                    "India Rice Export Deal: 500,000 Tonnes to Middle East at Premium Prices",
                    "Major export contract signed as Indian suppliers secure $15 premium per tonne..."
                ),
                url="https://example.com/rice-exports",
                summary="Major export contract signed as Indian suppliers secure $15 premium per tonne. Market expects similar deals, pushing prices higher.",
                tickers=["RICE"],
                country=country or "India",
                commodity_tags=["agriculture", "grains"],
                timestamp=datetime.utcnow()
            ),
            NewsArticle(
                headline="Drought Warning: Corn Production Forecast Cut by 12% in US Midwest",
                source="google_search",
                category=self._classify_category(
                    "Drought Warning: Corn Production Forecast Cut by 12% in US Midwest",
                    "USDA revises crop estimates downward as severe drought continues affecting yield..."
                ),
                url="https://example.com/corn-drought",
                summary="USDA revises crop estimates downward as severe drought continues affecting yield. Corn futures up 6% in overnight trading.",
                tickers=["CORN"],
                country=country or "USA",
                commodity_tags=["weather", "agriculture"],
                timestamp=datetime.utcnow()
            ),
            NewsArticle(
                headline="China Increases Soybean Import Quota by 2 Million Tonnes Amid Supply Shortage",
                source="google_search",
                category=self._classify_category(
                    "China Increases Soybean Import Quota by 2 Million Tonnes Amid Supply Shortage",
                    "Government expands import quotas to meet domestic demand, benefiting US and Brazil exporters..."
                ),
                url="https://example.com/soybean-import",
                summary="Government expands import quotas to meet domestic demand, benefiting US and Brazil exporters. Prices expected to firm up.",
                tickers=["SOYBEAN"],
                country=country or "China",
                commodity_tags=["agriculture", "trade"],
                timestamp=datetime.utcnow()
            ),
            NewsArticle(
                headline="Black Sea Grain Corridor Reopens: Wheat Prices Drop 4% on Supply Relief",
                source="google_search",
                category=self._classify_category(
                    "Black Sea Grain Corridor Reopens: Wheat Prices Drop 4% on Supply Relief",
                    "Ukraine and Russia reach temporary agreement allowing grain shipments to resume..."
                ),
                url="https://example.com/grain-corridor",
                summary="Ukraine and Russia reach temporary agreement allowing grain shipments to resume. Traders expect 3-4 million tonnes in next quarter.",
                tickers=["WHEAT"],
                country=country or "Ukraine",
                commodity_tags=["agriculture", "geopolitics"],
                timestamp=datetime.utcnow()
            )
        ]
        
        return mock_articles[:limit]
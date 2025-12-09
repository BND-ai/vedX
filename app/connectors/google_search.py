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
        
        # Build search query focused on trading impact
        search_terms = []
        
        # Add commodity first
        if commodity:
            search_terms.append(commodity)
        elif query:
            search_terms.append(query)
        
        # Add trading-focused keywords
        trading_keywords = [
            "price", "trading", "export", "import", 
            "supply disruption", "demand", "market"
        ]
        
        # Randomly select 2-3 trading keywords to make query more specific
        import random
        selected_keywords = random.sample(trading_keywords, min(2, len(trading_keywords)))
        search_terms.extend(selected_keywords)
        
        # Add country if specified
        if country:
            search_terms.append(country)
        
        if not search_terms:
            search_terms = ["commodity trading news", "price movements"]
        
        # Build final query with OR for better results
        # Example: "wheat (price OR trading OR export) India"
        if len(search_terms) > 1:
            base_term = search_terms[0]
            keywords = search_terms[1:-1] if country else search_terms[1:]
            keyword_part = " OR ".join(keywords) if len(keywords) > 1 else keywords[0]
            location = search_terms[-1] if country else ""
            
            if location:
                search_query = f"{base_term} ({keyword_part}) {location}"
            else:
                search_query = f"{base_term} {keyword_part}"
        else:
            search_query = " ".join(search_terms)
        
        # Check if API key is configured
        if not self.api_key or self.api_key == "your_google_api_key_here":
            logger.warning("Google API key not configured, returning mock data")
            return self._get_mock_data(search_query, country, limit)
        
        # Make API request
        params = {
            "key": self.api_key,
            "cx": self.search_engine_id,
            "q": search_query,
            "num": min(limit, 10)  # Google allows max 10 per request
        }
        
        response = await self._make_request(self.base_url, params=params)
        
        if not response or "items" not in response:
            logger.warning("Google Search returned no results")
            return []
        
        # Normalize results
        articles = []
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
            articles.append(article)
        
        return articles[:limit]
    
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

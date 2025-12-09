"""
Perplexity API connector
"""
from typing import List, Optional
from datetime import datetime
from app.connectors.base import BaseConnector
from app.models.schemas import NewsArticle
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class PerplexityConnector(BaseConnector):
    """Connector for Perplexity API"""
    
    def __init__(self):
        super().__init__()
        self.api_key = settings.PERPLEXITY_API_KEY
        self.base_url = "https://api.perplexity.ai/chat/completions"
    
    async def fetch_news(
        self,
        query: Optional[str] = None,
        country: Optional[str] = None,
        commodity: Optional[str] = None,
        limit: int = 10
    ) -> List[NewsArticle]:
        """Fetch news from Perplexity API"""
        
        # Build search query
        search_terms = []
        if commodity:
            search_terms.append(f"{commodity} commodity")
        if country:
            search_terms.append(f"in {country}")
        if query:
            search_terms.append(query)
        
        if not search_terms:
            search_terms = ["latest commodity and agriculture news"]
        
        search_query = " ".join(search_terms)
        prompt = f"Find the latest news about {search_query}. Provide headlines and brief summaries."
        
        # Check if API key is configured
        if not self.api_key or self.api_key == "your_perplexity_api_key_here":
            logger.warning("Perplexity API key not configured, returning mock data")
            return self._get_mock_data(country, commodity, limit)
        
        # Make API request
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        json_data = {
            "model": "llama-3.1-sonar-small-128k-online",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a news aggregator. Provide factual, recent news headlines."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }
        
        response = await self._make_request(
            self.base_url,
            method="POST",
            headers=headers,
            json_data=json_data
        )
        
        if not response:
            logger.warning("Perplexity API returned no results")
            return self._get_mock_data(country, commodity, limit)
        
        # Parse response and create articles
        # Note: Actual parsing would depend on Perplexity's response format
        articles = self._parse_perplexity_response(response, country, commodity)
        
        return articles[:limit]
    
    def _parse_perplexity_response(
        self, 
        response: dict, 
        country: Optional[str],
        commodity: Optional[str]
    ) -> List[NewsArticle]:
        """Parse Perplexity API response into NewsArticle objects"""
        articles = []
        
        try:
            content = response.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            # Simple parsing - split by newlines and create articles
            # In production, you'd want more sophisticated parsing
            lines = [line.strip() for line in content.split("\n") if line.strip()]
            
            for line in lines[:10]:
                if len(line) > 20:  # Filter out very short lines
                    article = NewsArticle(
                        headline=line,
                        source="perplexity",
                        summary=line,
                        tickers=self._extract_tickers(line),
                        country=country,
                        commodity_tags=self._extract_commodity_tags(line),
                        timestamp=datetime.utcnow()
                    )
                    articles.append(article)
        except Exception as e:
            logger.error(f"Error parsing Perplexity response: {str(e)}")
        
        return articles
    
    def _get_mock_data(
        self, 
        country: Optional[str], 
        commodity: Optional[str],
        limit: int
    ) -> List[NewsArticle]:
        """Return mock data when API key is not configured"""
        mock_articles = [
            NewsArticle(
                headline="Soybean Exports Reach Record High This Quarter",
                source="perplexity",
                summary="Soybean exports have reached unprecedented levels...",
                tickers=["SOYBEAN"],
                country=country or "Brazil",
                commodity_tags=["agriculture", "grains"],
                timestamp=datetime.utcnow()
            ),
            NewsArticle(
                headline="Cotton Prices Stabilize After Volatile Week",
                source="perplexity",
                summary="Cotton commodity prices have stabilized following market volatility...",
                tickers=["COTTON"],
                country=country or "India",
                commodity_tags=["agriculture"],
                timestamp=datetime.utcnow()
            ),
            NewsArticle(
                headline="Gold Reaches New Peak Amid Economic Uncertainty",
                source="perplexity",
                summary="Gold prices have surged to new highs as investors seek safe havens...",
                tickers=["GOLD"],
                country=country or "Global",
                commodity_tags=["metals"],
                timestamp=datetime.utcnow()
            )
        ]
        
        return mock_articles[:limit]

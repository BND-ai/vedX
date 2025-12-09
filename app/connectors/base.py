"""
Base connector class for all data sources
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import httpx
import logging
from app.models.schemas import NewsArticle, NewsCategory
from app.config import settings
from app.utils.category_classifier import classifier

logger = logging.getLogger(__name__)


class BaseConnector(ABC):
    """Abstract base class for all news source connectors"""
    
    def __init__(self):
        self.source_name = self.__class__.__name__.replace("Connector", "").lower()
        self.timeout = settings.REQUEST_TIMEOUT
        self.classifier = classifier
        
    @abstractmethod
    async def fetch_news(
        self, 
        query: Optional[str] = None,
        country: Optional[str] = None,
        commodity: Optional[str] = None,
        limit: int = 10
    ) -> List[NewsArticle]:
        """
        Fetch news from the source and return normalized articles
        
        Args:
            query: Search query string
            country: Filter by country
            commodity: Filter by commodity
            limit: Maximum number of results
            
        Returns:
            List of normalized NewsArticle objects
        """
        pass
    
    async def _make_request(
        self, 
        url: str, 
        method: str = "GET",
        headers: Optional[Dict[str, str]] = None,
        params: Optional[Dict[str, Any]] = None,
        json_data: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Make HTTP request with error handling
        
        Args:
            url: Request URL
            method: HTTP method
            headers: Request headers
            params: Query parameters
            json_data: JSON body
            
        Returns:
            Response JSON or None if failed
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=headers,
                    params=params,
                    json=json_data
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            logger.error(f"{self.source_name} request failed: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"{self.source_name} unexpected error: {str(e)}")
            return None
    
    def _extract_tickers(self, text: str) -> List[str]:
        """
        Extract commodity/stock tickers from text
        
        Args:
            text: Text to extract tickers from
            
        Returns:
            List of ticker symbols
        """
        # Common commodity tickers
        commodity_keywords = {
            "wheat": "WHEAT",
            "corn": "CORN",
            "rice": "RICE",
            "soybean": "SOYBEAN",
            "cotton": "COTTON",
            "gold": "GOLD",
            "silver": "SILVER",
            "crude": "CRUDE",
            "oil": "CRUDE",
            "natural gas": "NATGAS",
            "copper": "COPPER"
        }
        
        text_lower = text.lower()
        tickers = []
        
        for keyword, ticker in commodity_keywords.items():
            if keyword in text_lower and ticker not in tickers:
                tickers.append(ticker)
                
        return tickers
    
    def _extract_commodity_tags(self, text: str) -> List[str]:
        """
        Extract commodity category tags from text
        
        Args:
            text: Text to extract tags from
            
        Returns:
            List of commodity tags
        """
        tag_keywords = {
            "agriculture": ["agriculture", "farming", "crop", "harvest"],
            "grains": ["wheat", "corn", "rice", "grain"],
            "energy": ["oil", "gas", "crude", "energy", "petroleum"],
            "metals": ["gold", "silver", "copper", "metal"],
            "weather": ["weather", "climate", "temperature", "rainfall", "drought"],
            "livestock": ["cattle", "livestock", "beef", "pork"],
            "dairy": ["milk", "dairy", "cheese"]
        }
        
        text_lower = text.lower()
        tags = []
        
        for tag, keywords in tag_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                if tag not in tags:
                    tags.append(tag)
                    
        return tags
    
    def _classify_category(self, headline: str, summary: Optional[str] = None) -> NewsCategory:
        """
        Classify news article into a category
        
        Args:
            headline: Article headline
            summary: Article summary (optional)
            
        Returns:
            NewsCategory enum value
        """
        return self.classifier.classify_article(headline, summary)


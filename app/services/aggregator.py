"""
News aggregator service - orchestrates multiple connectors
"""
from typing import List, Optional, Dict, Tuple
import asyncio
import logging
from app.models.schemas import NewsArticle, SourceType
from app.connectors import (
    GoogleSearchConnector,
    PerplexityConnector,
    BaiduNewsConnector,
    ZeeBusinessConnector,
    AgroPortalsConnector
)

logger = logging.getLogger(__name__)


class NewsAggregatorService:
    """Service to aggregate news from multiple sources"""
    
    def __init__(self):
        """Initialize all connectors"""
        self.connectors = {
            SourceType.GOOGLE_SEARCH: GoogleSearchConnector(),
            SourceType.PERPLEXITY: PerplexityConnector(),
            SourceType.BAIDU_NEWS: BaiduNewsConnector(),
            SourceType.ZEE_BUSINESS: ZeeBusinessConnector(),
            SourceType.AGRO_PORTALS: AgroPortalsConnector()
        }
    
    async def fetch_from_source(
        self,
        source: SourceType,
        query: Optional[str] = None,
        country: Optional[str] = None,
        commodity: Optional[str] = None,
        limit: int = 10
    ) -> Tuple[List[NewsArticle], Optional[str]]:
        """
        Fetch news from a specific source
        
        Returns:
            Tuple of (articles, error_message)
        """
        try:
            connector = self.connectors.get(source)
            if not connector:
                return [], f"Unknown source: {source}"
            
            articles = await connector.fetch_news(
                query=query,
                country=country,
                commodity=commodity,
                limit=limit
            )
            return articles, None
            
        except Exception as e:
            error_msg = f"Error fetching from {source}: {str(e)}"
            logger.error(error_msg)
            return [], error_msg
    
    async def fetch_from_all_sources(
        self,
        query: Optional[str] = None,
        country: Optional[str] = None,
        commodity: Optional[str] = None,
        category: Optional[str] = None,
        limit_per_source: int = 5
    ) -> Tuple[List[NewsArticle], List[str], List[str]]:
        """
        Fetch news from all sources concurrently
        
        Returns:
            Tuple of (all_articles, successful_sources, failed_sources)
        """
        # Create tasks for all connectors
        tasks = []
        source_names = []
        
        # Modify query based on category to get relevant results
        search_query = query
        if query and category and category != "overview":
            category_keywords = {
                "trade": "export import trade tariff shipment",
                "price": "price cost market forecast inflation",
                "supply_demand": "supply demand production consumption inventory shortage",
                "climate": "weather drought rain flood harvest season",
                "geopolitics": "policy government ban regulation tax conflict"
            }
            if category in category_keywords:
                # Add keywords to query to improve relevance
                search_query = f"{query} {category_keywords[category]}"
        
        for source_type, connector in self.connectors.items():
            tasks.append(
                connector.fetch_news(
                    query=search_query,
                    country=country,
                    commodity=commodity,
                    limit=limit_per_source
                )
            )
            source_names.append(source_type.value)
        
        # Execute all tasks concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        all_articles = []
        successful_sources = []
        failed_sources = []
        
        for source_name, result in zip(source_names, results):
            if isinstance(result, Exception):
                logger.error(f"Source {source_name} failed: {str(result)}")
                failed_sources.append(source_name)
            elif isinstance(result, list):
                all_articles.extend(result)
                if result:  # Only add to successful if we got results
                    successful_sources.append(source_name)
                else:
                    failed_sources.append(source_name)
            else:
                failed_sources.append(source_name)
        
        # Sort articles by timestamp (newest first)
        all_articles.sort(key=lambda x: x.timestamp, reverse=True)
        
        return all_articles, successful_sources, failed_sources
    
    def filter_articles(
        self,
        articles: List[NewsArticle],
        country: Optional[str] = None,
        state: Optional[str] = None,
        commodity: Optional[str] = None,
        ticker: Optional[str] = None,
        category: Optional[str] = None
    ) -> List[NewsArticle]:
        """
        Filter articles based on criteria
        
        Args:
            articles: List of articles to filter
            country: Filter by country
            state: Filter by state/region
            commodity: Filter by commodity tag
            ticker: Filter by ticker symbol
            category: Filter by news category
            
        Returns:
            Filtered list of articles
        """
        filtered = articles
        
        if country:
            filtered = [
                a for a in filtered 
                if a.country and country.lower() in a.country.lower()
            ]
        
        if state:
            filtered = [
                a for a in filtered
                if a.state and state.lower() in a.state.lower()
            ]
        
        if commodity:
            filtered = [
                a for a in filtered
                if any(commodity.lower() in tag.lower() for tag in a.commodity_tags)
            ]
        
        if ticker:
            ticker_upper = ticker.upper()
            filtered = [
                a for a in filtered
                if ticker_upper in a.tickers
            ]
        
        if category and category != "overview":
            filtered = [
                a for a in filtered
                if a.category.value == category
            ]
        
        return filtered


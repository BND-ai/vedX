"""
API routes for news aggregation
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from datetime import datetime

from app.models.schemas import (
    AggregatedNewsResponse,
    ResponseMetadata,
    SourceType,
    NewsCategory,
    HealthResponse,
    ErrorResponse
)
from app.services import NewsAggregatorService
from app.services.cache_service import cache
from app.utils.normalizer import deduplicate_articles
from app.config import settings

router = APIRouter(prefix="/api/v1", tags=["news"])

# Initialize service
news_service = NewsAggregatorService()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint
    
    Returns service status and version information
    """
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        timestamp=datetime.utcnow()
    )


@router.get("/news", response_model=AggregatedNewsResponse)
async def get_aggregated_news(
    query: Optional[str] = Query(None, description="Search query"),
    country: Optional[str] = Query(None, description="Filter by country"),
    state: Optional[str] = Query(None, description="Filter by state/region"),
    commodity: Optional[str] = Query(None, description="Filter by commodity"),
    ticker: Optional[str] = Query(None, description="Filter by ticker symbol"),
    limit: int = Query(10, ge=1, le=100, description="Maximum results per source"),
    deduplicate: bool = Query(True, description="Remove duplicate articles")
):
    """
    Get aggregated news from all sources
    
    Fetches news from all available sources concurrently and returns
    normalized, aggregated results.
    
    **Query Parameters:**
    - **query**: Search term (e.g., "wheat prices")
    - **country**: Country filter (e.g., "India", "USA")
    - **state**: State/region filter (e.g., "Maharashtra", "California")
    - **commodity**: Commodity filter (e.g., "agriculture", "metals")
    - **ticker**: Ticker symbol filter (e.g., "WHEAT", "GOLD")
    - **limit**: Max results per source (1-100)
    - **deduplicate**: Remove duplicate headlines
    
    **Example:**
    ```
    GET /api/v1/news?commodity=agriculture&country=India&state=Maharashtra&limit=5
    ```
    """
    try:
        # Fetch from all sources
        articles, successful_sources, failed_sources = await news_service.fetch_from_all_sources(
            query=query,
            country=country,
            commodity=commodity,
            limit_per_source=limit
        )
        
        # Apply additional filters if specified
        if ticker or state or (country and not country in [a.country for a in articles if a.country]):
            articles = news_service.filter_articles(
                articles=articles,
                country=country,
                state=state,
                commodity=commodity,
                ticker=ticker
            )
        
        # Deduplicate if requested
        if deduplicate:
            articles = deduplicate_articles(articles)
        
        # Create response
        return AggregatedNewsResponse(
            status="success",
            data=articles,
            metadata=ResponseMetadata(
                total_results=len(articles),
                sources_used=successful_sources,
                failed_sources=failed_sources,
                timestamp=datetime.utcnow()
            )
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/news/product/{product}", response_model=AggregatedNewsResponse)
async def get_product_news(
    product: str,
    category: Optional[NewsCategory] = Query(None, description="Filter by news category"),
    country: Optional[str] = Query(None, description="Filter by country"),
    state: Optional[str] = Query(None, description="Filter by state/region"),
    limit: int = Query(10, ge=1, le=50, description="Maximum results"),
    refresh: bool = Query(False, description="Force refresh cache")
):
    """
    Get news for a specific product/commodity with category filtering
    
    **Product-Specific News with Categories:**
    - Overview: All news types combined
    - Trade: Import/export, trading volumes, deals
    - Price: Price movements, forecasts, market analysis
    - Supply & Demand: Production, consumption, inventory
    - Climate: Weather impact, seasonal effects
    - Geopolitics: Policies, regulations, international relations
    
    **Path Parameters:**
    - **product**: Product/commodity name (e.g., wheat, gold, rice, corn)
    
    **Query Parameters:**
    - **category**: News category (overview, trade, price, supply_demand, climate, geopolitics)
    - **country**: Country filter
    - **state**: State/region filter
    - **limit**: Max results (1-50)
    - **refresh**: Force cache refresh (bypasses 1-hour cache)
    
    **Examples:**
    ```
    GET /api/v1/news/product/wheat
    GET /api/v1/news/product/wheat?category=trade
    GET /api/v1/news/product/wheat?category=price&country=India
    GET /api/v1/news/product/gold?category=geopolitics&refresh=true
    ```
    
    **Caching:**
    - Results are cached for 1 hour per product+category combination
    - Use `refresh=true` to bypass cache and get fresh data
    - Cache improves response time from ~2s to <100ms
    """
    try:
        # Build cache key
        category_str = category.value if category else "overview"
        cache_key = f"product_{product}_{category_str}_{country or 'all'}_{state or 'all'}"
        
        # Check cache unless refresh requested
        if not refresh:
            cached_response = cache.get(cache_key)
            if cached_response:
                return cached_response
        
        # Fetch news for the product
        # Request more items than needed to ensure we have enough after filtering
        fetch_limit = limit * 2 if category else limit
        
        articles, successful_sources, failed_sources = await news_service.fetch_from_all_sources(
            query=product,
            country=country,
            commodity=product,
            category=category_str,
            limit_per_source=fetch_limit
        )
        
        # Filter by category and other criteria
        articles = news_service.filter_articles(
            articles=articles,
            country=country,
            state=state,
            category=category_str,
            ticker=product.upper()  # Try to match as ticker too
        )
        
        # Deduplicate
        articles = deduplicate_articles(articles)
        
        # Create response
        response = AggregatedNewsResponse(
            status="success",
            data=articles[:limit],
            metadata=ResponseMetadata(
                total_results=len(articles[:limit]),
                sources_used=successful_sources,
                failed_sources=failed_sources,
                timestamp=datetime.utcnow()
            )
        )
        
        # Cache the response
        cache.set(cache_key, response, ttl_seconds=3600)  # 1 hour
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/news/{source}", response_model=AggregatedNewsResponse)
async def get_news_from_source(
    source: SourceType,
    query: Optional[str] = Query(None, description="Search query"),
    country: Optional[str] = Query(None, description="Filter by country"),
    commodity: Optional[str] = Query(None, description="Filter by commodity"),
    limit: int = Query(10, ge=1, le=100, description="Maximum results")
):
    """
    Get news from a specific source
    
    Fetches news from a single specified source.
    
    **Path Parameters:**
    - **source**: Source name (google_search, perplexity, baidu_news, zee_business, agro_portals)
    
    **Query Parameters:**
    - **query**: Search term
    - **country**: Country filter
    - **commodity**: Commodity filter
    - **limit**: Max results (1-100)
    
    **Example:**
    ```
    GET /api/v1/news/zee_business?commodity=metals&limit=5
    ```
    """
    try:
        articles, error = await news_service.fetch_from_source(
            source=source,
            query=query,
            country=country,
            commodity=commodity,
            limit=limit
        )
        
        if error:
            raise HTTPException(status_code=500, detail=error)
        
        return AggregatedNewsResponse(
            status="success",
            data=articles,
            metadata=ResponseMetadata(
                total_results=len(articles),
                sources_used=[source.value] if articles else [],
                failed_sources=[] if articles else [source.value],
                timestamp=datetime.utcnow()
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sources")
async def get_available_sources():
    """
    Get list of available news sources
    
    Returns information about all available data sources.
    """
    sources = [
        {
            "name": "google_search",
            "description": "Google Custom Search API",
            "categories": ["general", "commodities", "weather"]
        },
        {
            "name": "perplexity",
            "description": "Perplexity AI API",
            "categories": ["general", "commodities", "agriculture"]
        },
        {
            "name": "baidu_news",
            "description": "Baidu News",
            "categories": ["general", "commodities", "asia"]
        },
        {
            "name": "zee_business",
            "description": "Zee Business RSS Feeds",
            "categories": ["commodities", "markets", "india"]
        },
        {
            "name": "agro_portals",
            "description": "Agricultural News Portals",
            "categories": ["agriculture", "farming", "livestock"]
        }
    ]
    
    return {
        "status": "success",
        "sources": sources,
        "total": len(sources)
    }


@router.get("/categories")
async def get_available_categories():
    """
    Get list of available news categories
    
    Returns information about all news categories for classification.
    """
    categories = [
        {
            "name": "overview",
            "label": "Overview",
            "description": "All news types combined"
        },
        {
            "name": "trade",
            "label": "Trade",
            "description": "Import/export, trading volumes, deals"
        },
        {
            "name": "price",
            "label": "Price",
            "description": "Price movements, forecasts, market analysis"
        },
        {
            "name": "supply_demand",
            "label": "Supply & Demand",
            "description": "Production, consumption, inventory"
        },
        {
            "name": "climate",
            "label": "Climate",
            "description": "Weather impact, seasonal effects"
        },
        {
            "name": "geopolitics",
            "label": "Geopolitics",
            "description": "Policies, regulations, international relations"
        }
    ]
    
    return {
        "status": "success",
        "categories": categories,
        "total": len(categories)
    }


@router.get("/cache/stats")
async def get_cache_stats():
    """
    Get cache statistics
    
    Returns cache performance metrics including hits, misses, and hit rate.
    """
    return {
        "status": "success",
        "cache_stats": cache.get_stats()
    }

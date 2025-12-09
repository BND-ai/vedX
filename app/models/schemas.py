"""
Pydantic models for request/response schemas
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class SourceType(str, Enum):
    """Available data sources"""
    GOOGLE_SEARCH = "google_search"
    PERPLEXITY = "perplexity"
    BAIDU_NEWS = "baidu_news"
    ZEE_BUSINESS = "zee_business"
    AGRO_PORTALS = "agro_portals"
    ALL = "all"


class NewsCategory(str, Enum):
    """News categories for classification"""
    OVERVIEW = "overview"  # All news types combined
    TRADE = "trade"  # Import/export, trading volumes, deals
    PRICE = "price"  # Price movements, forecasts, market analysis
    SUPPLY_DEMAND = "supply_demand"  # Production, consumption, inventory
    CLIMATE = "climate"  # Weather impact, seasonal effects
    GEOPOLITICS = "geopolitics"  # Policies, regulations, international relations


class NewsArticle(BaseModel):
    """Normalized news article schema"""
    headline: str = Field(..., description="Article headline/title")
    source: str = Field(..., description="Source connector name")
    category: NewsCategory = Field(default=NewsCategory.OVERVIEW, description="News category")
    tickers: List[str] = Field(default_factory=list, description="Related stock/commodity tickers")
    country: Optional[str] = Field(None, description="Related country")
    state: Optional[str] = Field(None, description="Related state/region within country")
    commodity_tags: List[str] = Field(default_factory=list, description="Commodity categories")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Article timestamp")
    url: Optional[str] = Field(None, description="Article URL")
    summary: Optional[str] = Field(None, description="Article summary/snippet")
    
    class Config:
        json_schema_extra = {
            "example": {
                "headline": "Wheat prices surge amid global supply concerns",
                "source": "zee_business",
                "tickers": ["WHEAT", "CORN"],
                "country": "India",
                "commodity_tags": ["agriculture", "grains"],
                "timestamp": "2025-11-28T06:00:00Z",
                "url": "https://example.com/article",
                "summary": "Global wheat prices have increased by 15% this week..."
            }
        }


class ResponseMetadata(BaseModel):
    """Metadata for aggregated responses"""
    total_results: int = Field(..., description="Total number of articles returned")
    sources_used: List[str] = Field(..., description="List of sources that returned data")
    failed_sources: List[str] = Field(default_factory=list, description="Sources that failed to fetch")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")


class AggregatedNewsResponse(BaseModel):
    """Response schema for aggregated news"""
    status: str = Field(default="success", description="Response status")
    data: List[NewsArticle] = Field(..., description="List of news articles")
    metadata: ResponseMetadata = Field(..., description="Response metadata")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "success",
                "data": [
                    {
                        "headline": "Wheat prices surge amid global supply concerns",
                        "source": "zee_business",
                        "tickers": ["WHEAT"],
                        "country": "India",
                        "commodity_tags": ["agriculture", "grains"],
                        "timestamp": "2025-11-28T06:00:00Z",
                        "url": "https://example.com/article"
                    }
                ],
                "metadata": {
                    "total_results": 1,
                    "sources_used": ["zee_business"],
                    "failed_sources": [],
                    "timestamp": "2025-11-28T06:07:45Z"
                }
            }
        }


class ErrorResponse(BaseModel):
    """Error response schema"""
    status: str = Field(default="error", description="Response status")
    message: str = Field(..., description="Error message")
    detail: Optional[Dict[str, Any]] = Field(None, description="Additional error details")


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Current timestamp")

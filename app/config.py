"""
Application configuration using Pydantic Settings
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # App Configuration
    APP_NAME: str = "Ananta News Aggregator"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # News API Keys
    GOOGLE_CUSTOM_SEARCH_API_KEY: str = ""
    GOOGLE_CUSTOM_SEARCH_ENGINE_ID: str = ""
    PERPLEXITY_API_KEY: str = ""
    
    # Price Data API Keys
    ALPHA_VANTAGE_API_KEY: str = ""
    FRED_API_KEY: str = ""
    YAHOO_FINANCE_API_KEY: str = ""
    QUANDL_API_KEY: str = ""
    TWELVE_DATA_API_KEY: str = ""
    
    # Weather & Climate API Keys
    OPEN_METEO_API_KEY: str = ""
    NOAA_API_KEY: str = ""
    WEATHER_API_KEY: str = ""
    CLIMATE_DATA_API_KEY: str = ""
    USDA_NASS_API_KEY: str = ""
    
    # Agricultural Data API Keys
    FAO_API_KEY: str = ""
    USDA_API_KEY: str = ""
    AGRICULTURE_API_KEY: str = ""
    CROP_DATA_API_KEY: str = ""
    
    # Economic Data API Keys
    WORLD_BANK_API_KEY: str = ""
    IMF_API_KEY: str = ""
    OECD_API_KEY: str = ""
    ECONOMIC_DATA_API_KEY: str = ""
    
    # Trade Data API Keys
    UN_COMTRADE_API_KEY: str = ""
    TRADE_DATA_API_KEY: str = ""
    CUSTOMS_API_KEY: str = ""
    
    # Request Configuration
    REQUEST_TIMEOUT: int = 30
    CACHE_ENABLED: bool = False
    CACHE_TTL: int = 3600
    # Custom TTL and update intervals
    CLIMATE_DATA_CACHE_TTL: int = 1800
    WEATHER_UPDATE_INTERVAL: int = 3600
    PRICE_UPDATE_INTERVAL: int = 900
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://per-ton.ai",
        "https://www.per-ton.ai",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()

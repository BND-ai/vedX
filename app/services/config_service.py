import os
from typing import Dict, Optional

class ConfigService:
    """Centralized configuration service for all API keys"""
    
    def __init__(self):
        self._load_config()
    
    def _load_config(self):
        """Load all API keys from environment"""
        # News APIs
        self.google_search_key = os.getenv("GOOGLE_CUSTOM_SEARCH_API_KEY")
        self.google_search_engine_id = os.getenv("GOOGLE_CUSTOM_SEARCH_ENGINE_ID")
        self.perplexity_key = os.getenv("PERPLEXITY_API_KEY")
        
        # Price Data APIs
        self.alpha_vantage_key = os.getenv("ALPHA_VANTAGE_API_KEY")
        self.fred_key = os.getenv("FRED_API_KEY")
        self.yahoo_finance_key = os.getenv("YAHOO_FINANCE_API_KEY")
        self.quandl_key = os.getenv("QUANDL_API_KEY")
        self.twelve_data_key = os.getenv("TWELVE_DATA_API_KEY")
        
        # Weather & Climate APIs
        self.open_meteo_key = os.getenv("OPEN_METEO_API_KEY")
        self.noaa_key = os.getenv("NOAA_API_KEY")
        self.weather_api_key = os.getenv("WEATHER_API_KEY")
        self.climate_data_key = os.getenv("CLIMATE_DATA_API_KEY")
        self.usda_nass_key = os.getenv("USDA_NASS_API_KEY")
        
        # Agricultural Data APIs
        self.fao_key = os.getenv("FAO_API_KEY")
        self.usda_key = os.getenv("USDA_API_KEY")
        self.agriculture_key = os.getenv("AGRICULTURE_API_KEY")
        self.crop_data_key = os.getenv("CROP_DATA_API_KEY")
        
        # Economic Data APIs
        self.world_bank_key = os.getenv("WORLD_BANK_API_KEY")
        self.imf_key = os.getenv("IMF_API_KEY")
        self.oecd_key = os.getenv("OECD_API_KEY")
        self.economic_data_key = os.getenv("ECONOMIC_DATA_API_KEY")
        
        # Trade Data APIs
        self.un_comtrade_key = os.getenv("UN_COMTRADE_API_KEY")
        self.trade_data_key = os.getenv("TRADE_DATA_API_KEY")
        self.customs_key = os.getenv("CUSTOMS_API_KEY")
    
    def get_api_key(self, service: str) -> Optional[str]:
        """Get API key for specific service"""
        key_map = {
            'google_search': self.google_search_key,
            'perplexity': self.perplexity_key,
            'alpha_vantage': self.alpha_vantage_key,
            'fred': self.fred_key,
            'yahoo_finance': self.yahoo_finance_key,
            'quandl': self.quandl_key,
            'twelve_data': self.twelve_data_key,
            'open_meteo': self.open_meteo_key,
            'noaa': self.noaa_key,
            'weather_api': self.weather_api_key,
            'climate_data': self.climate_data_key,
            'usda_nass': self.usda_nass_key,
            'fao': self.fao_key,
            'usda': self.usda_key,
            'agriculture': self.agriculture_key,
            'crop_data': self.crop_data_key,
            'world_bank': self.world_bank_key,
            'imf': self.imf_key,
            'oecd': self.oecd_key,
            'economic_data': self.economic_data_key,
            'un_comtrade': self.un_comtrade_key,
            'trade_data': self.trade_data_key,
            'customs': self.customs_key
        }
        return key_map.get(service)
    
    def is_service_enabled(self, service: str) -> bool:
        """Check if service has valid API key"""
        key = self.get_api_key(service)
        return key is not None and key.strip() != ""
    
    def get_enabled_services(self) -> Dict[str, bool]:
        """Get status of all services"""
        services = [
            'google_search', 'perplexity', 'alpha_vantage', 'fred', 'yahoo_finance',
            'quandl', 'twelve_data', 'open_meteo', 'noaa', 'weather_api',
            'climate_data', 'usda_nass', 'fao', 'usda', 'agriculture',
            'crop_data', 'world_bank', 'imf', 'oecd', 'economic_data',
            'un_comtrade', 'trade_data', 'customs'
        ]
        return {service: self.is_service_enabled(service) for service in services}

# Global config instance
config = ConfigService()
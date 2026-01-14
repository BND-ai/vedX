from fastapi import APIRouter
from app.services.config_service import config

router = APIRouter()

@router.get("/api/v1/status")
async def get_api_status():
    """Get status of all API services"""
    enabled_services = config.get_enabled_services()
    
    # Group by category
    status = {
        "news_apis": {
            "google_search": enabled_services.get("google_search", False),
            "perplexity": enabled_services.get("perplexity", False)
        },
        "price_apis": {
            "alpha_vantage": enabled_services.get("alpha_vantage", False),
            "fred": enabled_services.get("fred", False),
            "yahoo_finance": enabled_services.get("yahoo_finance", False),
            "quandl": enabled_services.get("quandl", False),
            "twelve_data": enabled_services.get("twelve_data", False)
        },
        "weather_apis": {
            "open_meteo": enabled_services.get("open_meteo", False),
            "noaa": enabled_services.get("noaa", False),
            "weather_api": enabled_services.get("weather_api", False),
            "climate_data": enabled_services.get("climate_data", False),
            "usda_nass": enabled_services.get("usda_nass", False)
        },
        "agricultural_apis": {
            "fao": enabled_services.get("fao", False),
            "usda": enabled_services.get("usda", False),
            "agriculture": enabled_services.get("agriculture", False),
            "crop_data": enabled_services.get("crop_data", False)
        },
        "economic_apis": {
            "world_bank": enabled_services.get("world_bank", False),
            "imf": enabled_services.get("imf", False),
            "oecd": enabled_services.get("oecd", False),
            "economic_data": enabled_services.get("economic_data", False)
        },
        "trade_apis": {
            "un_comtrade": enabled_services.get("un_comtrade", False),
            "trade_data": enabled_services.get("trade_data", False),
            "customs": enabled_services.get("customs", False)
        }
    }
    
    # Count enabled services
    total_services = sum(len(category) for category in status.values())
    enabled_count = sum(sum(category.values()) for category in status.values())
    
    return {
        "status": "success",
        "data": status,
        "summary": {
            "total_services": total_services,
            "enabled_services": enabled_count,
            "disabled_services": total_services - enabled_count,
            "coverage_percentage": round((enabled_count / total_services) * 100, 1)
        }
    }